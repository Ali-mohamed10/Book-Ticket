import { useTranslation } from 'react-i18next';

export const BookingSummary = ({ selectedTables, onCheckout }) => {
  const { t } = useTranslation();

  const total = selectedTables.reduce((sum, table) => sum + parseFloat(table.price || 0), 0);

  return (
    <div className="bg-card border border-border p-6 rounded-lg shadow-sm flex flex-col h-full min-h-[300px]">
      <h3 className="font-bold font-sans text-xl mb-6 text-primary border-b border-border pb-4">
        {t('seatMap.summary', 'Booking Summary')}
      </h3>
      
      <div className="flex-1 overflow-y-auto mb-6 pr-2 space-y-3">
        {selectedTables.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            {t('seatMap.selectTable', 'Click on a table to select it for booking.')}
          </p>
        ) : (
          selectedTables.map((table) => (
            <div key={table.id} className="flex justify-between items-center bg-secondary/10 p-3 rounded-lg border border-border/50">
              <div>
                <span className="font-bold text-foreground block">{table.table_code}</span>
                <span className="text-xs text-muted-foreground">{t('seatMap.persons', '{{count}} persons', { count: table.capacity })}</span>
              </div>
              <span className="font-bold text-foreground">${table.price}</span>
            </div>
          ))
        )}
      </div>
      
      <div className="border-t border-border pt-4 mt-auto">
        <div className="flex justify-between items-end mb-6">
          <span className="text-muted-foreground font-medium">{t('seatMap.total', 'Total')}</span>
          <span className="font-bold font-sans text-3xl text-primary">${total.toFixed(2)}</span>
        </div>
        
        <button
          onClick={onCheckout}
          disabled={selectedTables.length === 0}
          className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('seatMap.proceedToCheckout', 'Proceed to Checkout')}
        </button>
      </div>
    </div>
  );
};
