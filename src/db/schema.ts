import { sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());
const createdAt = () =>
  integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`);

/* ---------- Better Auth tabuľky (user, session, account, verification) ---------- */

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  // Naše profilové polia
  district: text("district"),
  bio: text("bio"),
  phone: text("phone"),
  phoneVisible: integer("phone_visible", { mode: "boolean" }).notNull().default(false),
});

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (t) => [index("session_user_idx").on(t.userId)],
);

export const account = sqliteTable(
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
    accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (t) => [index("account_user_idx").on(t.userId)],
);

export const verification = sqliteTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }),
    updatedAt: integer("updated_at", { mode: "timestamp" }),
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)],
);

/* ---------- Po známosti ---------- */

/** Známosť dvoch ľudí. Ukladá sa raz: user_a má vždy menšie id ako user_b. */
export const connection = sqliteTable(
  "connection",
  {
    userA: text("user_a")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    userB: text("user_b")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: text("status", { enum: ["pending", "confirmed"] })
      .notNull()
      .default("confirmed"),
    createdAt: createdAt(),
  },
  (t) => [
    primaryKey({ columns: [t.userA, t.userB] }),
    index("connection_user_b_idx").on(t.userB),
  ],
);

export const category = sqliteTable("category", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
});

/** Služba, ktorú niekto ponúka. Zobrazuje sa až keď ju poskytovateľ potvrdí (active). */
export const providerService = sqliteTable(
  "provider_service",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    categoryId: integer("category_id")
      .notNull()
      .references(() => category.id),
    description: text("description"),
    district: text("district"),
    active: integer("active", { mode: "boolean" }).notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("provider_service_user_category_idx").on(t.userId, t.categoryId),
    index("provider_service_category_idx").on(t.categoryId),
  ],
);

/** Zaručenie sa: from_user pozná for_user a odporúča ho na danú službu. */
export const vouch = sqliteTable(
  "vouch",
  {
    id: id(),
    fromUserId: text("from_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    forUserId: text("for_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    categoryId: integer("category_id")
      .notNull()
      .references(() => category.id),
    note: text("note"),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("vouch_unique_idx").on(t.fromUserId, t.forUserId, t.categoryId),
    index("vouch_for_idx").on(t.forUserId),
  ],
);

/** Jednorazová pozvánka, voliteľne so zaručením (category + note). Platí 30 dní. */
export const invite = sqliteTable(
  "invite",
  {
    token: text("token").primaryKey(),
    fromUserId: text("from_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    inviteeName: text("invitee_name"),
    categoryId: integer("category_id").references(() => category.id),
    note: text("note"),
    acceptedBy: text("accepted_by").references(() => user.id, { onDelete: "set null" }),
    acceptedAt: integer("accepted_at", { mode: "timestamp" }),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("invite_from_idx").on(t.fromUserId)],
);

/** Správa poskytovateľovi cez kontaktný formulár (odošle sa e-mailom). */
export const contactRequest = sqliteTable("contact_request", {
  id: id(),
  fromUserId: text("from_user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  toUserId: text("to_user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  categoryId: integer("category_id").references(() => category.id),
  message: text("message").notNull(),
  createdAt: createdAt(),
});
