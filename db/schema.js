import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  uuid,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";

export const genderEnum = pgEnum("gender", ["male", "female"]);
export const exerciseExperienceEnum = pgEnum("exercise_experience", [
  "never",
  "beginner",
  "intermediate",
  "advanced",
]);

export const exerciseCategoryEnum = pgEnum("exercise_category", [
  "push",
  "pull",
  "legs",
]);

export const qrStatusEnum = pgEnum("qr_status", [
  "active",
  "scanned",
  "deactivated",
]);

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  phoneNumber: text("phone_number"),
  role: text("role").default("user").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const accessCodes = pgTable("access_codes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  code: text("code").notNull().unique(),
  isRedeemed: boolean("is_redeemed").default(false).notNull(),
  redeemedByUserId: text("redeemed_by_user_id").references(() => user.id),
  redeemedAt: timestamp("redeemed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productCategories = pgTable("product_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => productCategories.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const qrCodes = pgTable("qr_codes", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").notNull().unique(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => productCategories.id, { onDelete: "cascade" }),
  status: qrStatusEnum("status").default("active").notNull(),
  batchNumber: text("batch_number"),
  scannedAt: timestamp("scanned_at"),
  scanCount: integer("scan_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userProducts = pgTable("user_products", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  serialCode: text("serial_code")
    .notNull()
    .unique()
    .references(() => qrCodes.code, { onDelete: "cascade" }),
  registeredAt: timestamp("registered_at").defaultNow().notNull(),
});

export const userProfiles = pgTable(
  "user_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),

    gender: genderEnum("gender").notNull(),
    age: integer("age").notNull(),
    weightKg: integer("weight_kg").notNull(),

    maxPullUps: integer("max_pull_ups").default(0).notNull(),
    maxDips: integer("max_dips").default(0).notNull(),

    experienceYears: exerciseExperienceEnum("experience_years")
      .default("beginner")
      .notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("user_profiles_userId_idx").on(table.userId)],
);

export const benchExercises = pgTable("bench_exercises", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  category: exerciseCategoryEnum("category").notNull(),

  startImageUrl: text("start_image_url").notNull(),
  finishImageUrl: text("finish_image_url").notNull(),

  instructions: text("instructions").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workoutLogs = pgTable(
  "workout_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    splitCategory: exerciseCategoryEnum("split_category").notNull(),
    durationMinutes: integer("duration_minutes"),
    completedAt: timestamp("completed_at").defaultNow().notNull(),
  },
  (table) => [
    index("workout_logs_user_date_idx").on(table.userId, table.completedAt),
  ],
);


export const workoutLogDetails = pgTable("workout_log_details", {
  id: uuid("id").defaultRandom().primaryKey(),
  workoutLogId: uuid("workout_log_id")
    .notNull()
    .references(() => workoutLogs.id, { onDelete: "cascade" }),
  exerciseId: uuid("exercise_id")
    .notNull()
    .references(() => benchExercises.id, { onDelete: "cascade" }),
  
  setsCompleted: integer("sets_completed").notNull(),
  repsCompleted: integer("reps_completed").notNull(),
  weightUsedKg: integer("weight_used_kg"),           
});
