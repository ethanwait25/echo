CREATE TABLE "profile" (

    -- Note: Supabase's auth.user's table takes care of:
    --  * user_id
    --  * email (unique)
    --  * password, encryption

    "user_id" UUID PRIMARY KEY
        REFERENCES auth.users (id) ON DELETE CASCADE,
    "first_name"   VARCHAR(50) NOT NULL,
    "last_name"    VARCHAR(50) NOT NULL,
    "display_name" VARCHAR(50) NOT NULL,
    "timezone"     VARCHAR(50) NOT NULL,
    "created_at"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "entry" (
    "entry_id"   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "user_id"    UUID NOT NULL REFERENCES "profile"("user_id") ON DELETE CASCADE,
    "entry_date" DATE NOT NULL,
    "title"      VARCHAR(255),
    "full_text"  TEXT NOT NULL,
    "word_count" INTEGER NOT NULL,
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE "paragraph" (
    "pg_id"    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "entry_id" BIGINT NOT NULL REFERENCES "entry"("entry_id") ON DELETE CASCADE,
    "pg_index" INTEGER NOT NULL,
    "text"     TEXT NOT NULL
);

CREATE TABLE "embedding" (
    "emb_id"     BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "owner_type" VARCHAR(50) NOT NULL
                    CHECK ("owner_type" IN ('entry', 'paragraph', 'caption')),
    "owner_id"   BIGINT NOT NULL,
    "dim"        INTEGER NOT NULL,
    "vector"     vector NOT NULL
);

CREATE TABLE "entry_sentiment" (
    "entry_id"      BIGINT PRIMARY KEY
                        REFERENCES "entry"("entry_id") ON DELETE CASCADE,
    "anger"         DOUBLE PRECISION NOT NULL DEFAULT 0,
    "disgust"       DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fear"          DOUBLE PRECISION NOT NULL DEFAULT 0,
    "joy"           DOUBLE PRECISION NOT NULL DEFAULT 0,
    "neutral"       DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sadness"       DOUBLE PRECISION NOT NULL DEFAULT 0,
    "surprise"      DOUBLE PRECISION NOT NULL DEFAULT 0,
    "analyzed_at"   TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE "paragraph_sentiment" (
    "pg_id"         BIGINT PRIMARY KEY
                        REFERENCES "paragraph"("pg_id") ON DELETE CASCADE,
    "anger"         DOUBLE PRECISION NOT NULL DEFAULT 0,
    "disgust"       DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fear"          DOUBLE PRECISION NOT NULL DEFAULT 0,
    "joy"           DOUBLE PRECISION NOT NULL DEFAULT 0,
    "neutral"       DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sadness"       DOUBLE PRECISION NOT NULL DEFAULT 0,
    "surprise"      DOUBLE PRECISION NOT NULL DEFAULT 0,
    "analyzed_at"   TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE "tag" (
    "tag_id"   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "entry_id" BIGINT NOT NULL REFERENCES "entry"("entry_id") ON DELETE CASCADE,
    "name"     VARCHAR(50) NOT NULL,
    CONSTRAINT "tag_entry_name_unique" UNIQUE ("entry_id", "name")
);

CREATE TABLE "attachment" (
    "att_id"        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "entry_id"      BIGINT NOT NULL REFERENCES "entry"("entry_id") ON DELETE CASCADE,
    "caption"       TEXT NULL,
    "file_name"     VARCHAR(255) NOT NULL,
    "storage_path"  VARCHAR(255) NOT NULL,
    "file_type"     VARCHAR(255) NOT NULL
                        CHECK ("file_type" IN ('image', 'audio', 'document'))
);

CREATE TABLE "group" (
    "grp_id"        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "name"          VARCHAR(50) NOT NULL,
    "description"   VARCHAR(255) NOT NULL,
    "created_at"    TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL
);

CREATE TABLE "user_group" (
    "user_id" UUID NOT NULL
                REFERENCES "profile"("user_id") ON DELETE CASCADE,
    "grp_id"  BIGINT NOT NULL
                REFERENCES "group"("grp_id") ON DELETE CASCADE,
    PRIMARY KEY ("user_id", "grp_id")
);

CREATE TABLE "entry_group" (
    "entry_id"  BIGINT NOT NULL
                    REFERENCES "entry"("entry_id") ON DELETE CASCADE,
    "grp_id"    BIGINT NOT NULL
                    REFERENCES "group"("grp_id") ON DELETE CASCADE,
    PRIMARY KEY ("entry_id", "grp_id")
);

create or replace function public.get_closest_embeddings(
  query_embedding vector(1536),
  match_count int default 25
)
returns table (
  emb_id bigint,
  owner_id bigint,
  owner_type varchar(50),
  similarity double precision
)
language sql
stable
as $$
  select
    e.emb_id,
    e.owner_id,
    e.owner_type,
    1 - (e.vector <=> query_embedding) as similarity
  from embedding e
  order by e.vector <=> query_embedding
  limit match_count;
$$;