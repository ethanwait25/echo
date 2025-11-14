CREATE TABLE "User"(
    "user_id" BIGINT NOT NULL,
    "first_name" BIGINT NOT NULL,
    "last_name" VARCHAR(50) NOT NULL,
    "email" VARCHAR(50) NOT NULL,
    "pass_hash" VARCHAR(50) NOT NULL,
    "pass_salt" VARCHAR(50) NOT NULL,
    "display_name" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    "timezone" VARCHAR(15) NOT NULL
);
ALTER TABLE
    "User" ADD PRIMARY KEY("user_id");
CREATE TABLE "Entry"(
    "entry_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "entry_date" DATE NOT NULL,
    "title" VARCHAR(255) NULL,
    "full_text" TEXT NOT NULL,
    "word_count" INTEGER NOT NULL,
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    "updated_at" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL
);
ALTER TABLE
    "Entry" ADD PRIMARY KEY("entry_id");
CREATE TABLE "Paragraph"(
    "pg_id" BIGINT NOT NULL,
    "entry_id" BIGINT NOT NULL,
    "index" INTEGER NOT NULL,
    "text" TEXT NOT NULL
);
ALTER TABLE
    "Paragraph" ADD PRIMARY KEY("pg_id");
CREATE TABLE "Embedding"(
    "emb_id" BIGINT NOT NULL,
    "owner_type" VARCHAR(255) CHECK
        ("owner_type" IN('')) NOT NULL,
        "owner_id" BIGINT NOT NULL,
        "model_name" VARCHAR(50) NOT NULL,
        "dim" INTEGER NOT NULL,
        "vector" jsonb NOT NULL
);
ALTER TABLE
    "Embedding" ADD PRIMARY KEY("emb_id");
CREATE TABLE "EntrySentiment"(
    "entry_id" BIGINT NOT NULL,
    "sentiment_score" FLOAT(53) NOT NULL,
    "sentiment_label" VARCHAR(255) CHECK
        ("sentiment_label" IN('')) NOT NULL,
        "model_name" VARCHAR(50) NOT NULL,
        "analyzed_at" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL
);
ALTER TABLE
    "EntrySentiment" ADD PRIMARY KEY("entry_id");
CREATE TABLE "ParagraphSentiment"(
    "pg_id" BIGINT NOT NULL,
    "sentiment_score" FLOAT(53) NOT NULL,
    "sentiment_label" VARCHAR(255) CHECK
        ("sentiment_label" IN('')) NOT NULL,
        "model_name" VARCHAR(50) NOT NULL,
        "analyzed_at" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL
);
ALTER TABLE
    "ParagraphSentiment" ADD PRIMARY KEY("pg_id");
CREATE TABLE "Tag"(
    "tag_id" BIGINT NOT NULL,
    "entry_id" BIGINT NOT NULL,
    "name" VARCHAR(50) NOT NULL
);
ALTER TABLE
    "Tag" ADD PRIMARY KEY("tag_id");
CREATE TABLE "Attachment"(
    "att_id" BIGINT NOT NULL,
    "entry_id" BIGINT NOT NULL,
    "caption_id" BIGINT NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_type" VARCHAR(255) CHECK
        ("file_type" IN('')) NOT NULL
);
ALTER TABLE
    "Attachment" ADD PRIMARY KEY("att_id");
CREATE TABLE "Caption"(
    "caption_id" BIGINT NOT NULL,
    "text" TEXT NOT NULL
);
ALTER TABLE
    "Caption" ADD PRIMARY KEY("caption_id");
CREATE TABLE "Group"(
    "grp_id" BIGINT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL
);
ALTER TABLE
    "Group" ADD PRIMARY KEY("grp_id");
CREATE TABLE "UserGroup"(
    "user_id" BIGINT NOT NULL,
    "grp_id" BIGINT NOT NULL
);
ALTER TABLE
    "UserGroup" ADD PRIMARY KEY("user_id");
ALTER TABLE
    "UserGroup" ADD PRIMARY KEY("grp_id");
CREATE TABLE "EntryGroup"(
    "entry_id" BIGINT NOT NULL,
    "grp_id" BIGINT NOT NULL
);
ALTER TABLE
    "EntryGroup" ADD PRIMARY KEY("entry_id");
ALTER TABLE
    "EntryGroup" ADD PRIMARY KEY("grp_id");
ALTER TABLE
    "Paragraph" ADD CONSTRAINT "paragraph_entry_id_foreign" FOREIGN KEY("entry_id") REFERENCES "Entry"("entry_id");
ALTER TABLE
    "Attachment" ADD CONSTRAINT "attachment_caption_id_foreign" FOREIGN KEY("caption_id") REFERENCES "Caption"("caption_id");
ALTER TABLE
    "Embedding" ADD CONSTRAINT "embedding_owner_id_foreign" FOREIGN KEY("owner_id") REFERENCES "Entry"("entry_id");
ALTER TABLE
    "Tag" ADD CONSTRAINT "tag_entry_id_foreign" FOREIGN KEY("entry_id") REFERENCES "Entry"("entry_id");
ALTER TABLE
    "Paragraph" ADD CONSTRAINT "paragraph_pg_id_foreign" FOREIGN KEY("pg_id") REFERENCES "ParagraphSentiment"("pg_id");
ALTER TABLE
    "Group" ADD CONSTRAINT "group_grp_id_foreign" FOREIGN KEY("grp_id") REFERENCES "EntryGroup"("grp_id");
ALTER TABLE
    "Entry" ADD CONSTRAINT "entry_entry_id_foreign" FOREIGN KEY("entry_id") REFERENCES "EntrySentiment"("entry_id");
ALTER TABLE
    "Embedding" ADD CONSTRAINT "embedding_owner_id_foreign" FOREIGN KEY("owner_id") REFERENCES "Caption"("caption_id");
ALTER TABLE
    "UserGroup" ADD CONSTRAINT "usergroup_user_id_foreign" FOREIGN KEY("user_id") REFERENCES "User"("user_id");
ALTER TABLE
    "Attachment" ADD CONSTRAINT "attachment_entry_id_foreign" FOREIGN KEY("entry_id") REFERENCES "Entry"("entry_id");
ALTER TABLE
    "Entry" ADD CONSTRAINT "entry_user_id_foreign" FOREIGN KEY("user_id") REFERENCES "User"("user_id");
ALTER TABLE
    "Embedding" ADD CONSTRAINT "embedding_owner_id_foreign" FOREIGN KEY("owner_id") REFERENCES "Paragraph"("pg_id");
ALTER TABLE
    "Entry" ADD CONSTRAINT "entry_entry_id_foreign" FOREIGN KEY("entry_id") REFERENCES "EntryGroup"("entry_id");
ALTER TABLE
    "Group" ADD CONSTRAINT "group_grp_id_foreign" FOREIGN KEY("grp_id") REFERENCES "UserGroup"("grp_id");