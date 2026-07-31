import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  useSeatMap, 
  useUpdateSeatMap, 
  useUpsertTables, 
  useUploadSvg,
  useUploadPreviewImage
} from '../../hooks/useSeatMaps';
import { extractTablesFromSvg } from '../../utils/svgParser';
import { TABLE_CATEGORIES } from '../../utils/seatMapConstants';

export const SeatMapEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const { data: seatMap, isLoading, refetch } = useSeatMap(id);
  const updateMapMutation = useUpdateSeatMap();
  const upsertTablesMutation = useUpsertTables();
  const uploadSvgMutation = useUploadSvg();
  const uploadPreviewMutation = useUploadPreviewImage();

  const [name, setName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [tables, setTables] = useState([]);
  
  // Initialize state when data loads
  useEffect(() => {
    if (seatMap) {
      setName(seatMap.name);
      setIsActive(seatMap.is_active);
      setTables(seatMap.tables || []);
    }
  }, [seatMap]);

  const handleSvgUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // 1. Read file to parse SVG text
      const text = await file.text();
      const detectedTables = extractTablesFromSvg(text);
      
      // 2. Upload file to Supabase Storage
      const svgUrl = await uploadSvgMutation.mutateAsync(file);
      
      // 3. Update Seat Map Record
      await updateMapMutation.mutateAsync({
        id,
        data: { svg_url: svgUrl }
      });
      
      // 4. Merge detected tables with existing ones (keep existing metadata if ids match)
      const mergedTables = detectedTables.map(dt => {
        const existing = tables.find(t => t.svg_element_id === dt.svgElementId);
        if (existing) {
          // Keep existing but update x/y just in case SVG changed layout
          return { ...existing, position_x: dt.x, position_y: dt.y };
        }
        return {
          seat_map_id: id,
          svg_element_id: dt.svgElementId,
          table_code: dt.tableCode,
          category: 'standard',
          capacity: 4,
          price: 0,
          status: 'available',
          position_x: dt.x,
          position_y: dt.y,
        };
      });
      
      setTables(mergedTables);
      
      // Immediately save the new tables to DB
      await upsertTablesMutation.mutateAsync(mergedTables);
      refetch();
      
    } catch (error) {
      console.error('Failed to process SVG', error);
      alert(t('admin.seatMaps.processError', 'Failed to process SVG'));
    }
  };

  const handlePreviewUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const url = await uploadPreviewMutation.mutateAsync(file);
      await updateMapMutation.mutateAsync({
        id,
        data: { preview_image_url: url }
      });
    } catch (error) {
      console.error('Failed to upload preview', error);
    }
  };

  const handleTableChange = (index, field, value) => {
    const newTables = [...tables];
    newTables[index] = { ...newTables[index], [field]: value };
    setTables(newTables);
  };

  const handleSaveAll = async () => {
    try {
      await updateMapMutation.mutateAsync({
        id,
        data: { name, is_active: isActive }
      });
      
      if (tables.length > 0) {
        await upsertTablesMutation.mutateAsync(tables);
      }
      
      alert(t('admin.seatMaps.saveSuccess', 'Saved successfully!'));
    } catch (error) {
      console.error('Failed to save', error);
      alert(t('admin.seatMaps.saveError', 'Failed to save'));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!seatMap) return <div>Seat map not found</div>;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <button 
            onClick={() => navigate('/admin/seat-maps')}
            className="text-sm text-muted-foreground hover:text-primary mb-2 flex items-center gap-1"
          >
            ← {t('admin.seatMaps.backToList', 'Back to Seat Maps')}
          </button>
          <h1 className="text-3xl font-bold font-sans text-primary">
            {t('admin.seatMaps.editTitle', 'Edit Seat Map')}
          </h1>
        </div>
        <button
          onClick={handleSaveAll}
          disabled={updateMapMutation.isPending || upsertTablesMutation.isPending}
          className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {t('admin.seatMaps.save', 'Save Changes')}
        </button>
      </div>

      {/* General Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-4">{t('admin.seatMaps.sectionGeneral', 'General Settings')}</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('admin.seatMaps.name', 'Name')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary w-4 h-4 bg-background"
              />
              <span className="text-sm font-medium">{t('admin.seatMaps.activeLabel', 'Active (Visible to public)')}</span>
            </label>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-4">{t('admin.seatMaps.sectionMedia', 'Media Files')}</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('admin.seatMaps.uploadSvg', 'Upload SVG')}
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept=".svg"
                  onChange={handleSvgUpload}
                  className="block w-full text-sm text-muted-foreground
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary/10 file:text-primary
                    hover:file:bg-primary/20 cursor-pointer"
                />
              </div>
              {seatMap.svg_url && (
                <p className="text-xs text-muted-foreground mt-2 break-all">
                  {t('admin.seatMaps.currentSvg', 'Current SVG')}: {seatMap.svg_url}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t('admin.seatMaps.uploadPreview', 'Upload Preview Image')}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePreviewUpload}
                className="block w-full text-sm text-muted-foreground
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-secondary/20 file:text-foreground
                  hover:file:bg-secondary/30 cursor-pointer"
              />
              {seatMap.preview_image_url && (
                <div className="mt-2 w-32 h-20 rounded overflow-hidden border border-border">
                  <img src={seatMap.preview_image_url} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tables List */}
      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border bg-secondary/10 flex justify-between items-center">
          <h2 className="text-lg font-bold">{t('admin.seatMaps.tablesEditor', 'Tables Editor')}</h2>
          <span className="text-sm text-muted-foreground font-medium bg-secondary/20 px-3 py-1 rounded-full">
            {t('admin.seatMaps.tablesDetected', '{{count}} tables detected', { count: tables.length })}
          </span>
        </div>
        
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary sticky top-0 z-10 text-muted-foreground border-b border-border">
              <tr>
                <th className="p-3 font-medium border-b border-border">{t('admin.seatMaps.svgId', 'SVG ID')}</th>
                <th className="p-3 font-medium border-b border-border">{t('admin.seatMaps.tableCode', 'Table Code')}</th>
                <th className="p-3 font-medium border-b border-border">{t('admin.seatMaps.category', 'Category')}</th>
                <th className="p-3 font-medium border-b border-border">{t('admin.seatMaps.capacity', 'Capacity')}</th>
                <th className="p-3 font-medium border-b border-border">{t('admin.seatMaps.price', 'Price ($)')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tables.map((table, index) => (
                <tr key={table.svg_element_id} className="hover:bg-secondary/5 transition-colors">
                  <td className="p-3 font-mono text-xs text-muted-foreground">
                    {table.svg_element_id}
                  </td>
                  <td className="p-3">
                    <input
                      type="text"
                      value={table.table_code}
                      onChange={(e) => handleTableChange(index, 'table_code', e.target.value)}
                      className="w-full bg-background border border-border rounded px-2 py-1 focus:ring-1 focus:ring-primary"
                    />
                  </td>
                  <td className="p-3">
                    <select
                      value={table.category}
                      onChange={(e) => handleTableChange(index, 'category', e.target.value)}
                      className="w-full bg-background border border-border rounded px-2 py-1 focus:ring-1 focus:ring-primary"
                    >
                      {Object.entries(TABLE_CATEGORIES).map(([key, cat]) => (
                        <option key={key} value={key}>{t(cat.label)}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      min="1"
                      value={table.capacity}
                      onChange={(e) => handleTableChange(index, 'capacity', parseInt(e.target.value))}
                      className="w-20 bg-background border border-border rounded px-2 py-1 focus:ring-1 focus:ring-primary"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={table.price}
                      onChange={(e) => handleTableChange(index, 'price', parseFloat(e.target.value))}
                      className="w-24 bg-background border border-border rounded px-2 py-1 focus:ring-1 focus:ring-primary"
                    />
                  </td>
                </tr>
              ))}
              {tables.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-muted-foreground italic">
                    {t('admin.seatMaps.uploadSvgHint', 'Upload an SVG file to automatically detect tables.')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SeatMapEditorPage;
