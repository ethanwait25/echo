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
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    "updated_at" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL
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
    "model_name" VARCHAR(50) NOT NULL,
    "dim"        INTEGER NOT NULL,
    "vector"     vector NOT NULL
);

CREATE TABLE "entry_sentiment" (
    "entry_id"        BIGINT PRIMARY KEY
                        REFERENCES "entry"("entry_id") ON DELETE CASCADE,
    "sentiment_score" DOUBLE PRECISION NOT NULL,
    "emotion"         VARCHAR(50) NOT NULL
                        CHECK ("emotion" IN ('anger', 'disgust', 'fear', 
                        'joy', 'neutral', 'sadness', 'surprise')),
    "model_name"      VARCHAR(50) NOT NULL,
    "analyzed_at"     TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL
);

CREATE TABLE "paragraph_sentiment" (
    "pg_id"           BIGINT PRIMARY KEY
                        REFERENCES "paragraph"("pg_id") ON DELETE CASCADE,
    "sentiment_score" DOUBLE PRECISION NOT NULL,
    "emotion"         VARCHAR(50) NOT NULL
                        CHECK ("emotion" IN ('anger', 'disgust', 'fear', 
                        'joy', 'neutral', 'sadness', 'surprise')),
    "model_name"      VARCHAR(50) NOT NULL,
    "analyzed_at"     TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL
);

CREATE TABLE "tag" (
    "tag_id"   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "entry_id" BIGINT NOT NULL REFERENCES "entry"("entry_id") ON DELETE CASCADE,
    "name"     VARCHAR(50) NOT NULL,
    CONSTRAINT "tag_entry_name_unique" UNIQUE ("entry_id", "name")
);

CREATE TABLE "caption" (
    "caption_id" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "text"       TEXT NOT NULL
);

CREATE TABLE "attachment" (
    "att_id"        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "entry_id"      BIGINT NOT NULL REFERENCES "entry"("entry_id") ON DELETE CASCADE,
    "caption_id"    BIGINT NOT NULL REFERENCES "caption"("caption_id") ON DELETE CASCADE,
    "file_path"     VARCHAR(255) NOT NULL,
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