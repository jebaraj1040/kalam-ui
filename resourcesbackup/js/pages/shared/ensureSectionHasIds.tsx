import { SchemaSection } from '@/pages/shared/DynamicSection';
import { v4 as uuidv4 } from 'uuid';

export default function ensureSectionHasIds(section: SchemaSection): SchemaSection {
    return {
        ...section,
        id: section.id || uuidv4(),
        children: section.children?.map(ensureSectionHasIds) || [],
    };
}
