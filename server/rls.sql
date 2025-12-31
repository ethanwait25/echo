-- Profile policies
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile FORCE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their profile"
ON profile
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can update their profile"
ON profile
FOR SELECT
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());


-- Entry policies
ALTER TABLE entry ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry FORCE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own entries"
ON entry
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own entries"
ON entry
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own entries"
ON entry
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own entries"
ON entry
FOR DELETE
USING (user_id = auth.uid());

CREATE Policy "Users can see entries from their groups"
ON entry
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM entry_group eg
    JOIN user_group ug
      ON eg.grp_id = ug.grp_id
    WHERE eg.entry_id = entry.entry_id
      AND ug.user_id = auth.uid()
  )
);


-- Paragraph policies
ALTER TABLE paragraph ENABLE ROW LEVEL SECURITY;
ALTER TABLE paragraph FORCE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own paragraphs"
ON paragraph
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM entry e
    WHERE e.entry_id = paragraph.entry_id
      AND e.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own paragraphs"
ON paragraph
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM entry e
    WHERE e.entry_id = paragraph.entry_id
      AND e.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own paragraphs"
ON paragraph
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM entry e
    WHERE e.entry_id = paragraph.entry_id
      AND e.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM entry e
    WHERE e.entry_id = paragraph.entry_id
      AND e.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own paragraphs"
ON paragraph
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM entry e
    WHERE e.entry_id = paragraph.entry_id
      AND e.user_id = auth.uid()
  )
);


-- Bucket policies
CREATE POLICY "Users can upload to their folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can read from their folder"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete from their folder"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);