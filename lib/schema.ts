import {
  pgTable, text, integer, primaryKey, boolean, timestamp, bigint, uuid
} from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id:            text('id').primaryKey(),
  name:          text('name'),
  email:         text('email').notNull().unique(),
  emailVerified: integer('emailVerified'),
  image:         text('image'),
  password:      text('password'),
  telegramchatid: text('telegramchatid'),
})

export const accounts = pgTable(
  'accounts',
  {
    userId:            text('userId').notNull()
                        .references(() => users.id, { onDelete: 'cascade' }),
    type:              text('type').notNull(),
    provider:          text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token:     text('refresh_token'),
    access_token:      text('access_token'),
    expires_at:        integer('expires_at'),
    token_type:        text('token_type'),
    scope:             text('scope'),
    id_token:          text('id_token'),
    session_state:     text('session_state'),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
)

export const sessions = pgTable('sessions', {
  sessionToken: text('sessionToken').primaryKey(),
  userId:       text('userId').notNull()
                .references(() => users.id, { onDelete: 'cascade' }),
  expires:      integer('expires').notNull(),
})

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token:      text('token').notNull().unique(),
    expires:    integer('expires').notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({
      columns: [vt.identifier, vt.token],
    }),
  })
)

// ─── TABLE: devices ─────────────────────────────────────────────────
export const devices = pgTable('devices', {
  id:           text('id').primaryKey(),
  name:         text('name').notNull(),
  device_code:  text('device_code').notNull().unique(),
  location:     text('location'),
  owner_id:     text('owner_id').notNull()
                .references(() => users.id, { onDelete: 'cascade' }),
  apikey:       text('apikey'),
  telegramchatid: text('telegramchatid'),
  status:       text('status').default('offline'),
  is_active:    boolean('is_active').default(true).notNull(),
  telegram_active: boolean('telegram_active').default(true).notNull(),
  firmware_version: text('firmware_version'),
  mq2_threshold: integer('mq2_threshold').default(400),
  mq135_threshold: integer('mq135_threshold').default(300),
  flame_threshold: integer('flame_threshold').default(500),
  last_seen_at: bigint('last_seen_at', { mode: 'number' }),
  lastseenat:   timestamp('lastseenat'),
  last_seen:    timestamp('last_seen'),
  is_online:    boolean('is_online').default(false),
  mq2_last:     integer('mq2_last').default(0),
  mq135_last:   integer('mq135_last').default(0),
  flame_last:   integer('flame_last').default(0),
  alert_last:   boolean('alert_last').default(false),
  created_at:   bigint('created_at', { mode: 'number' }).notNull(),
  updated_at:   bigint('updated_at', { mode: 'number' }).notNull(),
  sleep_mode_enabled: boolean('sleep_mode_enabled').default(false),
  sleep_start: text('sleep_start').default('22:00'),
  sleep_end: text('sleep_end').default('06:00'),
})

// ─── TABLE: sensor_readings ─────────────────────────────────────────
export const sensor_readings = pgTable('sensor_readings', {
  id:             text('id').primaryKey(),
  device_id:      text('device_id').notNull()
                  .references(() => devices.id, { onDelete: 'cascade' }),
  mq2_value:      integer('mq2_value'),
  mq135_value:    integer('mq135_value'),
  flame_value:    integer('flame_value'),
  mq2_ppm:        integer('mq2_ppm'),
  mq135_ppm:      integer('mq135_ppm'),
  flame_detected: boolean('flame_detected').default(false),
  is_alert:       boolean('is_alert').default(false).notNull(),
  recorded_at:    bigint('recorded_at', { mode: 'number' }).notNull(),
})

// ─── TABLE: alerts ───────────────────────────────────────────────────
export const alerts = pgTable('alerts', {
  id:             text('id').primaryKey(),
  device_id:      text('device_id').notNull()
                  .references(() => devices.id, { onDelete: 'cascade' }),
  type:           text('type').notNull(),
  severity:       text('severity').notNull(),
  mq2_value:      integer('mq2_value'),
  mq135_value:    integer('mq135_value'),
  flame_value:    integer('flame_value'),
  flame_detected: boolean('flame_detected').default(false),
  message:        text('message'),
  telegram_sent:  boolean('telegram_sent').default(false).notNull(),
  telegram_sent_at: bigint('telegram_sent_at', { mode: 'number' }),
  is_resolved:    boolean('is_resolved').default(false).notNull(),
  resolved_at:    bigint('resolved_at', { mode: 'number' }),
  resolved_by:    text('resolved_by')
                  .references(() => users.id),
  triggered_at:   bigint('triggered_at', { mode: 'number' }).notNull(),
})

// ─── TABLE: device_members ───────────────────────────────────────────
export const device_members = pgTable('device_members', {
  id:         text('id').primaryKey(),
  device_id:  text('device_id').notNull()
              .references(() => devices.id, { onDelete: 'cascade' }),
  user_id:    text('user_id').notNull()
              .references(() => users.id, { onDelete: 'cascade' }),
  role:       text('role').default('viewer').notNull(),
  receive_notifications: boolean('receive_notifications').default(true).notNull(),
  invited_at: bigint('invited_at', { mode: 'number' }).notNull(),
})

// ─── TABLE: notifications ────────────────────────────────────────────
export const notifications = pgTable('notifications', {
  id:         text('id').primaryKey(),
  user_id:    text('user_id').notNull()
              .references(() => users.id, { onDelete: 'cascade' }),
  alert_id:   text('alert_id')
              .references(() => alerts.id, { onDelete: 'set null' }),
  channel:    text('channel').notNull(),
  title:      text('title'),
  body:       text('body'),
  is_read:    boolean('is_read').default(false).notNull(),
  sent_at:    bigint('sent_at', { mode: 'number' }).notNull(),
  read_at:    bigint('read_at', { mode: 'number' }),
})

// ─── TABLE: settings ────────────────────────────────────────────────
export const settings = pgTable('settings', {
  key:   text('key').primaryKey(),
  value: text('value'),
})

// ─── TABLE: sensor_logs ───────────────────────────────────────────────
export const sensorLogs = pgTable('sensor_logs', {
  id:             uuid('id').primaryKey().defaultRandom(),
  device_id:      text('device_id').notNull()
                  .references(() => devices.id, { onDelete: 'cascade' }),
  mq2:            integer('mq2').notNull().default(0),
  mq135:          integer('mq135').notNull().default(0),
  flame:          integer('flame').notNull().default(0),
  flame_detected: boolean('flame_detected').notNull().default(false),
  is_alert:       boolean('is_alert').notNull().default(false),
  created_at:     timestamp('created_at').notNull().defaultNow(),
})

// ─── TABLE: waitlist ───────────────────────────────────────────────
export const waitlist = pgTable('waitlist', {
  id:         uuid('id').primaryKey().defaultRandom(),
  email:      text('email').notNull().unique(),
  created_at: timestamp('created_at').notNull().defaultNow(),
})

