CREATE TABLE "assistance_data" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" text NOT NULL,
	"months" integer DEFAULT 12,
	"lump_sum" numeric(10, 2) DEFAULT '0',
	"purchase_allowance" numeric(10, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "budget_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text,
	"code" text,
	"account_code" text,
	"name" text NOT NULL,
	"values" json DEFAULT '{}'::json,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" text NOT NULL,
	"name" text NOT NULL,
	"gender" text NOT NULL,
	"start_year" integer NOT NULL,
	"level" text NOT NULL,
	"status" text DEFAULT 'มีสิทธิ์',
	"visit_province" text NOT NULL,
	"home_visit_bus_fare" numeric(10, 2) DEFAULT '0',
	"working_days" integer DEFAULT 1,
	"travel_working_days" integer DEFAULT 1,
	"custom_travel_rates" json,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "employees_employee_id_unique" UNIQUE("employee_id")
);
--> statement-breakpoint
CREATE TABLE "holidays" (
	"id" serial PRIMARY KEY NOT NULL,
	"year" integer NOT NULL,
	"date" text NOT NULL,
	"name" text NOT NULL,
	"is_special" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "master_rates" (
	"id" serial PRIMARY KEY NOT NULL,
	"level" text NOT NULL,
	"position" text NOT NULL,
	"rent" numeric(10, 2) NOT NULL,
	"monthly_assist" numeric(10, 2) NOT NULL,
	"souvenir_allowance" numeric(10, 2) NOT NULL,
	"travel" numeric(10, 2) NOT NULL,
	"local" numeric(10, 2) NOT NULL,
	"per_diem" numeric(10, 2) NOT NULL,
	"hotel" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "master_rates_level_unique" UNIQUE("level")
);
--> statement-breakpoint
CREATE TABLE "overtime_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"year" integer NOT NULL,
	"item" text NOT NULL,
	"instances" integer DEFAULT 1,
	"days" integer DEFAULT 1,
	"hours" integer DEFAULT 8,
	"people" integer DEFAULT 1,
	"rate" numeric(10, 2),
	"salary" numeric(10, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "special_assist_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"year" integer NOT NULL,
	"item" text NOT NULL,
	"times_per_year" integer DEFAULT 1,
	"days" integer DEFAULT 1,
	"people" integer DEFAULT 1,
	"rate" numeric(10, 2) DEFAULT '0',
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
