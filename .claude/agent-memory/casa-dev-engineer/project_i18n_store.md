---
name: i18n and language store architecture
description: New i18n system and Zustand language store added across all screens — structure, patterns, and known issues
type: project
---

A full i18n layer was added supporting zh/ja/ko languages.

**Structure:**
- `src/shared/i18n/translations.ts` — exports `T` type, `Language` type, and `zh`/`ja`/`ko` objects + `TRANSLATIONS` map
- `src/shared/i18n/index.ts` — exports `useTranslation()` hook (reads from `useLanguageStore`)
- `src/shared/store/languageStore.ts` — Zustand store with `language`, `setLanguage`, `loadLanguage` (persisted via AsyncStorage key `app_language`)

**How to apply:** All new screens must call `const t = useTranslation()` and use `t.<key>`. Language defaults to `'zh'`. The language store is loaded once in `app/_layout.tsx` via `useEffect(() => { loadLanguage(); }, [loadLanguage])`.

**Known issues found during code review (2026-03-26):**
1. `app/(app)/(lists)/[listId].tsx` lines 145–146 and 156–157 have hardcoded Chinese strings (`'在下方添加物品'`, `'添加物品...'`) that bypass i18n — should use `t.listDetailEmpty` and `t.listDetailAddPlaceholder`
2. `app/(app)/(home)/index.tsx` line 421 has a hardcoded Chinese string `'积分'` in the TaskRow component — should use `t.reportsPointsUnit` or a dedicated key
3. `app/(auth)/sign-up.tsx` line 58 has a hardcoded fallback error string `'出现了一些问题'` — should use a translation key
4. `alarm-settings.tsx` has `locale="zh-CN"` hardcoded on the DateTimePicker — should derive locale from language store
