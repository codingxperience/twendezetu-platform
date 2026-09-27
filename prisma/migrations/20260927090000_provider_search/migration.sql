-- Provider search also reads the description, where people describe their
-- vehicles, menus and specialities ("Land Cruiser", "pilau", "gospel").
DROP INDEX IF EXISTS "Provider_search";
CREATE INDEX "Provider_search" ON "Provider" USING GIN (
  app_private.search_document("name", "headline", "city", "description")
);
