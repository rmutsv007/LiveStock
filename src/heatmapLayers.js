/**
 * heatmapLayers.js — รายการชั้นข้อมูล Heatmap / ความหนาแน่น (raster) จาก GeoServer
 * แต่ละ layer มี:
 *   id: ค่าเฉพาะสำหรับอ้างอิงใน React (ใช้เป็น key)
 *   name: ชื่อ layer ใน GeoServer (จะถูกเรียกเป็น LiveStock:<name> ผ่าน WMS)
 *   label: ชื่อที่แสดงใน Sidebar
 * ต่างจาก layers.js ตรงที่ heatmap เป็นภาพ raster ล้วน (ไม่มีจุด/ตารางข้อมูล)
 * และปรับความทึบ (opacity) ได้ผ่านแถบเลื่อนบนแผนที่
 */

const heatmapLayers = [
  { id: 'heatmap_broiler', name: 'heatmap_broiler', label: 'heatmap_broiler' },
  { id: 'heatmap_dairy', name: 'heatmap_dairy', label: 'heatmap_dairy' },
  { id: 'heatmap_pig', name: 'heatmap_pig', label: 'heatmap_pig' },
  { id: 'heatmap_poultry', name: 'heatmap_poultry', label: 'สัตว์ปีก' },
  { id: 'heatmap_ter', name: 'heatmap_ter', label: 'heatmap_ter' },
  { id: 'kernel_density_broiler', name: 'Kernel Density of Broiler Farms', label: 'Kernel Density of Broiler Farms' },
];

export default heatmapLayers; // ส่งออกรายการ heatmap layers
