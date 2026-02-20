CREATE TYPE "user_role" AS ENUM('mentor', 'student');
--> statement-breakpoint
CREATE TYPE "booking_status" AS ENUM('pending', 'confirmed', 'cancelled');
--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role" "user_role" NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"profile_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"bio" varchar NOT NULL,
	"linkedin_url" varchar(255),
	"avatar_url" varchar(500),
	CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"category_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mentorships" (
	"mentorship_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mentor_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" varchar(255) NOT NULL,
	"price" numeric NOT NULL,
	"slots" integer NOT NULL,
	"duration" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"booking_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"mentorship_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" "booking_status" NOT NULL,
	"scheduled_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "mentorships" ADD CONSTRAINT "mentorships_mentor_id_users_user_id_fk" FOREIGN KEY ("mentor_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "mentorships" ADD CONSTRAINT "mentorships_category_id_categories_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("category_id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_student_id_users_user_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_mentorship_id_mentorships_mentorship_id_fk" FOREIGN KEY ("mentorship_id") REFERENCES "public"."mentorships"("mentorship_id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "mentorships_mentor_id" ON "mentorships" USING btree ("mentor_id");
--> statement-breakpoint
CREATE INDEX "mentorships_category_id" ON "mentorships" USING btree ("category_id");
--> statement-breakpoint
CREATE INDEX "bookings_student_id" ON "bookings" USING btree ("student_id");
--> statement-breakpoint
CREATE INDEX "bookings_mentorship_id" ON "bookings" USING btree ("mentorship_id");
