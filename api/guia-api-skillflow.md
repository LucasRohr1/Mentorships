# Guia API - SkillFlow (Mentorship Platform)

## Objetivo
Este documento es la referencia viva para disenar e implementar la API de SkillFlow.
Define arquitectura, reglas de calidad, seguridad y consistencia tecnica.

## 1) Arquitectura base (Layered + Vertical Slices)
- `Controller`: solo HTTP (request/response), sin logica de negocio.
- `Service`: reglas de negocio, transacciones y coordinacion de casos de uso.
- `Repository`: acceso a datos con Drizzle ORM.
- `Schema/Validation`: fuente unica de verdad con Drizzle + Zod.

Estructura sugerida:
```text
src/
├── core/             # Middlewares, Errors, Config
├── modules/
│   ├── auth/
│   ├── users/
│   ├── mentorships/
│   └── bookings/
├── db/               # Connection, Migrations
└── app.ts            # Server setup
```

## 2) Principios de diseno (SOLID + Clean Code)
- Responsabilidad unica por capa/modulo (SRP).
- Inyeccion de dependencias en servicios (DIP) para testear con mocks/stubs.
- Sin estado global mutable para logica de negocio.
- Errores explicitos y consistentes (sin silencios ni catch-all vacios).
- KISS/YAGNI/DRY: evitar sobreingenieria y duplicacion.

## 3) Portabilidad y entorno
- No hardcodear rutas, puertos ni secretos.
- Configuracion por variables de entorno validadas al iniciar.
- Codigo agnostico de OS (comandos/scripts multiplataforma cuando sea posible).
- Preparado para contenedores (Docker/K8s): config externa y stateless app.

## 4) Seguridad y privacidad (baseline obligatorio)
- Hash de passwords con `bcrypt` (salt rounds: 10).
- JWT con `jose` para firma/verificacion.
- Middlewares obligatorios: `helmet`, `cors`, `verifyJWT` en rutas privadas.
- Nunca exponer secretos en codigo, logs o respuestas.
- Validar y sanear toda entrada externa (params/body/query/headers).

## 5) Relaciones de entidades (actualizado)
1. `User` <-> `Profile` (1:1)
- Logica: un usuario tiene un unico perfil (bio, foto, linkedin, etc).
- Motivo: mantener `users` liviana para autenticacion.
- Implementacion: `profiles.user_id` con `UNIQUE` + FK a `users.id`.

2. `Category` <-> `Mentorship` (1:N)
- Logica: una categoria agrupa muchas mentorias.
- Implementacion: `mentorships.category_id` como FK a `categories.id`.
- Beneficio API: permite endpoints por categoria (ej: listar mentorias por categoria).

3. `User` (mentor) <-> `Mentorship` (1:N)
- Logica: un mentor puede crear multiples mentorias.
- Implementacion: `mentorships.mentor_id` como FK a `users.id`.
- Regla de dominio: solo usuarios con rol mentor pueden publicar mentorias.

4. `User` (student) <-> `Mentorship` via `Bookings` (N:M)
- Logica: un alumno puede reservar muchas mentorias y cada mentoria muchos alumnos.
- Implementacion: `bookings` como tabla intermedia con `student_id` + `mentorship_id`.
- Extra: `bookings` almacena estado y metadata del vinculo (reserva/pago/sesion).

Resumen rapido:
- Identidad: `users` -> `profiles` (1:1, FK+UNIQUE en `profiles`).
- Organizacion: `categories` -> `mentorships` (1:N, FK en `mentorships`).
- Autoria: `users(mentor)` -> `mentorships` (1:N, FK en `mentorships`).
- Reserva: `users(student)` <-> `mentorships` (N:M via `bookings`).

### 5.1 Esquema de tablas (columnas)

Fuente unica de verdad para el modelo de datos. Implementar en Drizzle y derivar validacion Zod desde ahi.

#### users
| Columna | Tipo | Nullable | Descripcion |
|---------|------|----------|-------------|
| id | UUID | NO (PK) | `defaultRandom()` |
| email | VARCHAR(255) | NO, UNIQUE | Login |
| password_hash | VARCHAR(255) | NO | Hash bcrypt |
| role | user_role | NO | `mentor` \| `student` |

#### profiles
| Columna | Tipo | Nullable | Descripcion |
|---------|------|----------|-------------|
| id | UUID | NO (PK) | `defaultRandom()` |
| user_id | UUID | NO, UNIQUE | FK a `users.id` (1:1) |
| bio | TEXT | SÍ | Descripcion del usuario |
| avatar_url | VARCHAR(500) | SÍ | URL de foto de perfil |
| linkedin_url | VARCHAR(500) | SÍ | Perfil LinkedIn |
| x_url | VARCHAR(500) | SÍ | Perfil X/Twitter |

#### profile_documents
Tabla para documentos (PDF, etc.). Archivos en storage; DB solo metadata.

| Columna | Tipo | Nullable | Descripcion |
|---------|------|----------|-------------|
| id | UUID | NO (PK) | `defaultRandom()` |
| profile_id | UUID | NO | FK a `profiles.id` |
| file_url | VARCHAR(500) | NO | URL/path del archivo en storage |
| filename | VARCHAR(255) | NO | Nombre original |
| document_type | VARCHAR(50) | NO | ej: `pdf` |
| uploaded_at | TIMESTAMPTZ | NO | Auditoria |

#### categories
Seed predeterminado: cargar opciones iniciales (ej: Tech, Marketing, Design) via script de seed tras migraciones.

| Columna | Tipo | Nullable | Descripcion |
|---------|------|----------|-------------|
| id | UUID | NO (PK) | `defaultRandom()` |
| name | VARCHAR(100) | NO, UNIQUE | Nombre legible |

#### mentorships
| Columna | Tipo | Nullable | Descripcion |
|---------|------|----------|-------------|
| id | UUID | NO (PK) | `defaultRandom()` |
| title | VARCHAR(200) | NO | Nombre de la mentoría |
| description | TEXT | SÍ | Detalles, para quien, etc. |
| mentor_id | UUID | NO | FK a `users.id` |
| category_id | UUID | NO | FK a `categories.id` |
| duration_minutes | INTEGER | NO | Duracion por sesion (30, 45, 60) |
| price_cents | INTEGER | NO | Precio en centavos |
| slots | INTEGER | NO | Plazas disponibles (CHECK >= 0) |
| created_at | TIMESTAMPTZ | NO | Auditoria |

#### bookings
| Columna | Tipo | Nullable | Descripcion |
|---------|------|----------|-------------|
| id | UUID | NO (PK) | `defaultRandom()` |
| student_id | UUID | NO | FK a `users.id` |
| mentorship_id | UUID | NO | FK a `mentorships.id` |
| status | booking_status | NO | `pending` \| `confirmed` \| `cancelled` |
| created_at | TIMESTAMPTZ | NO | Cuando se reservo |
| scheduled_at | TIMESTAMPTZ | SÍ | Cuando es la sesion |

## 6) Restricciones de integridad y reglas de DB

### Restricciones por tabla
| Tabla | Restriccion | Motivo |
|-------|-------------|--------|
| `profiles` | `user_id UNIQUE NOT NULL` | Garantizar 1:1 real con `users` |
| `bookings` | `(student_id, mentorship_id) UNIQUE` (composite) | Evitar que un alumno reserve dos veces la misma mentoria |
| `mentorships` | `slots >= 0` (CHECK) | Ver seccion siguiente |
| `bookings` | `status IN ('pending','confirmed','cancelled')` | Dominio controlado de estados |

### Indices sugeridos
Para que sirven: permiten encontrar filas mas rapido sin escanear la tabla completa (ej: "todas las reservas del estudiante X"). A cambio, INSERT/UPDATE tienen un coste extra al mantener el indice.

- `bookings.student_id` — consultas por estudiante.
- `bookings.mentorship_id` — consultas por mentoria.
- `mentorships.category_id` — listar mentorias por categoria.
- `mentorships.mentor_id` — mentorias de un mentor.

### Regla anti-duplicado de reservas activas
No permitir otra reserva activa (`status != 'cancelled'`) para el mismo par `(student_id, mentorship_id)`. Sin esta regla, un estudiante podria tener varias reservas activas para la misma mentoria (duplicados, confusion). Las canceladas no cuentan como activas (posible re-reserva futura).

### CHECK (slots >= 0) y Booking atomico
El flujo de reserva es atomico: decrementar `slots` e insertar `bookings` en una transaccion. Si hay bug o condicion de carrera, dos reservas podrian leer `slots = 1` y ambas decrementar, dejando `slots = -1`. El `CHECK (slots >= 0)` impide guardar valores negativos: si se intenta, PostgreSQL rechaza el UPDATE y la transaccion falla. Es la red de seguridad a nivel DB cuando la logica falla.

## 7) Pipeline de validacion (Zod + drizzle-zod)

- Cada ruta que recibe body/params/query debe tener middleware de validacion.
- Schemas Zod derivados de Drizzle: `createInsertSchema(table)` y `createSelectSchema(table)` desde `drizzle-zod`.
- Refinements opcionales para reglas adicionales (ej: slots > 0).
- En fallo: responder 400 con formato consistente (ej: `{ success: false, errors: ZodError.flatten() }`).
- No poner logica de negocio en los schemas; solo validacion de forma y tipos.

```ts
// Ejemplo: schema derivado
export const insertMentorshipSchema = createInsertSchema(mentorships);
export type InsertMentorship = z.infer<typeof insertMentorshipSchema>;
```

## 8) Manejo global de errores

- **Sin try/catch en controllers:** Usar HOF `asyncHandler` que envuelve el handler y hace `.catch(next)`.
- **Middleware de errores:** Unico middleware `(err, req, res, next)` al final de la cadena que mapea errores a respuestas HTTP.
- **Libreria recomendada:** `http-errors` para lanzar errores con status (ej: `throw createError(404, 'Not found')`).
- **Mapeo de codigos:**
  - 400: ZodError (validacion).
  - 401: No token o token invalido.
  - 403: Token valido pero sin permisos.
  - 404: Recurso no encontrado.
  - 500: Errores no clasificados (no exponer stack al cliente en produccion).

## 9) Transaccion critica: flujo de Booking atomico

Secuencia obligatoria dentro de una transaccion (todo o nada):

1. **Verificar slots:** `SELECT slots FROM mentorships WHERE id = ?`; si `slots <= 0` → lanzar 400.
2. **Decrementar slots:** `UPDATE mentorships SET slots = slots - 1 WHERE id = ? AND slots > 0`. Usar operador `sql` de Drizzle para evitar race conditions (no leer-modificar-escribir en dos pasos).
3. **Comprobar filas afectadas:** Si el UPDATE no afecto filas, slots ya estaba en 0 → rollback y 400.
4. **Insertar booking:** `INSERT INTO bookings (student_id, mentorship_id, status, ...)` con `status: 'pending'`.
5. **Commit.** Si cualquier paso falla → rollback y propagar error.

El paso 2 con `slots > 0` en el WHERE + transaccion garantiza atomicidad junto al CHECK de la DB.

## 10) Patrones de diseño

- **Dependency Injection:** Servicios reciben repositorios por constructor (o factory) para poder inyectar mocks en tests. Evitar importar repos directamente dentro del service.
- **Singleton:** Una unica instancia de la conexion Drizzle para toda la app. Exportar desde `db/` y usar la misma referencia.
- **Factory para respuestas:** Funcion estandarizada que devuelve `{ success: true, data: T }` en exito y `{ success: false, error: string, errors?: ... }` en fallo. Mantiene consistencia en toda la API.

## 11) Subida de archivos (avatars, documentos PDF)

### Estrategia de almacenamiento
- **Para empezar:** Carpeta local en disco. Path configurado por variable de entorno (ej: `UPLOAD_PATH`).
- **Abstraccion:** Interfaz `StorageService` con metodo `upload(buffer, filename, mimetype) => url`. Implementaciones: `LocalFileStorage`, `S3Storage`, etc. La logica de negocio solo depende de la interfaz; cambiar a S3/R2 no afecta controllers ni services.

### Seguridad obligatoria
- Validar `mimetype` real (magic bytes), no solo extension del nombre.
- Limites de tamaño: ej. 5-10 MB para PDFs, 2 MB para avatares.
- Nombres unicos: UUID + extension para evitar colisiones y sobrescrituras.
- Solo usuarios autenticados; verificar que el perfil pertenece al usuario.
- No ejecutar contenido del archivo; solo guardar y servir estatico.

### Flujo API ejemplo
```
POST /profiles/me/documents
Content-Type: multipart/form-data (file)
1. Verificar JWT
2. Validar: mimetype permitido?, tamaño OK?
3. StorageService.upload() → URL
4. INSERT en profile_documents (profile_id, file_url, filename, document_type)
5. Responder metadata
```
