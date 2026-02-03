## Packages
(none needed)

## Notes
- UI utilise les composants Radix/shadcn déjà présents dans client/src/components/ui.
- Charts: Recharts est déjà installé et utilisé pour le dashboard.
- Toutes les requêtes utilisent credentials: "include" (cookies).
- Query params: utiliser buildUrl + URLSearchParams (dashboard summary et listes).
- Types: importer les types de requêtes depuis @shared/schema (CreateProspectRequest, UpdateProspectRequest, etc.).
