import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useSeatMaps, useCreateSeatMap, useDeleteSeatMap } from '../../hooks/useSeatMaps';

export const SeatMapsListPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: seatMaps, isLoading } = useSeatMaps();
  const createMutation = useCreateSeatMap();
  const deleteMutation = useDeleteSeatMap();

  const [isCreating, setIsCreating] = useState(false);
  const [newMapName, setNewMapName] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newMapName.trim()) return;

    try {
      const slug = newMapName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const newMap = await createMutation.mutateAsync({
        name: newMapName.trim(),
        slug: `${slug}-${Date.now()}` // Ensure unique slug
      });
      setIsCreating(false);
      setNewMapName('');
      navigate(`/admin/seat-maps/${newMap.id}`);
    } catch (error) {
      console.error('Failed to create seat map', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('admin.seatMaps.confirmDelete', 'Are you sure you want to delete this seat map? All associated tables will be deleted.'))) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete seat map', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-bold font-sans text-primary">
            {t('admin.seatMaps.title', 'Seat Maps')}
          </h1>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          {t('admin.seatMaps.createNew', 'Create New Seat Map')}
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="p-4 bg-secondary/10 border border-border rounded-lg flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">
              {t('admin.seatMaps.name', 'Name')}
            </label>
            <input
              type="text"
              value={newMapName}
              onChange={(e) => setNewMapName(e.target.value)}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 rounded-lg font-medium bg-secondary text-secondary-foreground hover:opacity-90 transition-opacity"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 rounded-lg font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {createMutation.isPending ? '...' : t('admin.seatMaps.save', 'Save Changes')}
            </button>
          </div>
        </form>
      )}

      {seatMaps?.length === 0 && !isCreating ? (
        <div className="text-center p-12 bg-secondary/5 border border-border border-dashed rounded-lg">
          <p className="text-muted-foreground">
            {t('admin.seatMaps.noSeatMaps', 'No seat maps yet.')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {seatMaps?.map((map) => (
            <div key={map.id} className="bg-card border border-border rounded-lg overflow-hidden flex flex-col shadow-sm">
              <div 
                className="h-48 bg-secondary/20 relative cursor-pointer"
                onClick={() => navigate(`/admin/seat-maps/${map.id}`)}
              >
                {map.preview_image_url ? (
                  <img 
                    src={map.preview_image_url} 
                    alt={map.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                    No Preview
                  </div>
                )}
                {!map.is_active && (
                  <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded">
                    Inactive
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-foreground mb-4">{map.name}</h3>
                
                <div className="flex items-center justify-between mt-auto">
                  <button
                    onClick={() => navigate(`/admin/seat-maps/${map.id}`)}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {t('admin.seatMaps.editTitle', 'Edit Seat Map')}
                  </button>
                  
                  <button
                    onClick={() => handleDelete(map.id)}
                    className="text-sm font-medium text-destructive hover:underline"
                    disabled={deleteMutation.isPending}
                  >
                    {t('admin.seatMaps.delete', 'Delete Seat Map')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SeatMapsListPage;
