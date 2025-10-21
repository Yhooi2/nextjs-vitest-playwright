# date-fns

## Версия в проекте
`4.1.0`

## Описание
date-fns - это функциональная библиотека для работы с датами.

## Common Usage

```typescript
import { format, formatDistance, addDays, isAfter } from 'date-fns';

// Formatting
format(new Date(), 'yyyy-MM-dd');  // "2024-01-15"
format(new Date(), 'PPP');          // "January 15th, 2024"

// Relative time
formatDistance(new Date(), addDays(new Date(), 3)); // "in 3 days"

// Comparison
isAfter(new Date(2024, 1, 1), new Date(2023, 12, 1)); // true
```

## Ссылки
- [date-fns Docs](https://date-fns.org)
