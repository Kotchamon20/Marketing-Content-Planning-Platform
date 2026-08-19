const fs = require('fs');
const filePath = 'src/components/ContentPlanModule.jsx';
let content = fs.readFileSync(filePath, 'utf8');

const hashFunc = `
  // ฟังก์ชันสุ่มสีคงที่ตามชื่อ SubCategory (ป้องกันกรณีไม่พบสีที่ตั้งไว้)
  const getFallbackColor = (name) => {
    if (!name) return SUB_CATEGORY_COLORS[0].value;
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % SUB_CATEGORY_COLORS.length;
    return SUB_CATEGORY_COLORS[index].value;
  };
`;

const getSubCatOld = `  // แสดง Badge สำหรับหมวดหมู่ย่อย (Sub-Category) — มินิมอลทรง Pill สไตล์ต้นแบบ
  const getSubCategoryBadge = (subCat) => {
    if (!subCat || !subCat.trim()) return null;
    // หาสีจาก subCategoryColors ของทุก Group
    let colorClass = DEFAULT_SUB_CAT_COLOR;
    for (const grp of effectiveContentGroups) {
      const colors = grp.subCategoryColors || {};
      if (colors[subCat]) {
        colorClass = colors[subCat];
        break;
      }
    }
    return (
      <span className={\`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold border \${colorClass} max-w-full truncate shadow-2xs leading-tight\`}>
        {subCat}
      </span>
    );
  };`;

const getSubCatNew = `  // แสดง Badge สำหรับหมวดหมู่ย่อย (Sub-Category) — มินิมอลทรง Pill สไตล์ต้นแบบ
  const getSubCategoryBadge = (subCat) => {
    if (!subCat || !subCat.trim()) return null;
    
    // 1. หาสีจาก subCategoryColors ของทุก Group
    let colorClass = null;
    for (const grp of effectiveContentGroups) {
      const colors = grp.subCategoryColors || {};
      if (colors[subCat]) {
        colorClass = colors[subCat];
        break;
      }
    }
    
    // 2. ถ้าไม่พบสี ให้ใช้สุ่มแบบ hash-based
    if (!colorClass) {
       // ฟังก์ชันสุ่มสีคงที่ตามชื่อ SubCategory
       let hash = 0;
       for (let i = 0; i < subCat.length; i++) {
         hash = subCat.charCodeAt(i) + ((hash << 5) - hash);
       }
       const index = Math.abs(hash) % SUB_CATEGORY_COLORS.length;
       colorClass = SUB_CATEGORY_COLORS[index].value;
    }

    return (
      <span className={\`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold border \${colorClass} max-w-full truncate shadow-2xs leading-tight\`}>
        {subCat}
      </span>
    );
  };`;

content = content.replace(getSubCatOld, getSubCatNew);
fs.writeFileSync(filePath, content, 'utf8');
console.log("Updated subCategory badge logic");
