import postgres from "postgres";

let sql;

const connectDB = async () => {
  try {
    sql = postgres(process.env.DATABASE_URL, {
      ssl: 'require',
      max: 10
    });
    // ===============================
    // USERS TABLE
    // ===============================
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        avatar VARCHAR(255),
        avatar_public_id VARCHAR(255),
        refresh_token TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Add refresh_token column if it doesn't exist (migration)
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'users' AND column_name = 'refresh_token'
        ) THEN
          ALTER TABLE users ADD COLUMN refresh_token TEXT;
        END IF;
      END;
      $$;
    `;

    // ===============================
    // CHATS TABLE (1-1 CHAT)
    // ===============================
    await sql`
      CREATE TABLE IF NOT EXISTS chats (
        id SERIAL PRIMARY KEY,
        user1_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        user2_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Prevent duplicate 1-1 chats
    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS unique_chat_users
      ON chats (LEAST(user1_id, user2_id), GREATEST(user1_id, user2_id));
    `;

    // ===============================
    // MESSAGES TABLE
    // ===============================
    await sql`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        chat_id INTEGER REFERENCES chats(id) ON DELETE CASCADE,
        sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    // ===============================
    // CHAT REQUESTS TABLE
    // ===============================
    await sql`
      CREATE TABLE IF NOT EXISTS chat_requests (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'pending', 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`;

    // ===============================
    // INDEXES FOR PERFORMANCE
    // ===============================
    await sql`
      CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_chats_user1_id ON chats(user1_id);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_chats_user2_id ON chats(user2_id);
    `;

    // ===============================
    // AUTO UPDATE updated_at TRIGGER
    // ===============================

    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `;

    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at'
        ) THEN
          CREATE TRIGGER update_users_updated_at
          BEFORE UPDATE ON users
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
        END IF;
      END;
      $$;
    `;

    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_trigger WHERE tgname = 'update_chats_updated_at'
        ) THEN
          CREATE TRIGGER update_chats_updated_at
          BEFORE UPDATE ON chats
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
        END IF;
      END;
      $$;
    `;

    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_trigger WHERE tgname = 'update_messages_updated_at'
        ) THEN
          CREATE TRIGGER update_messages_updated_at
          BEFORE UPDATE ON messages
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
        END IF;
      END;
      $$;
    `;

    console.log("✅ Database connected and initialized successfully");
  } catch (error) {
    console.error("❌ Database connection error:", error);
    throw error;
  }
};

export { connectDB, sql };

