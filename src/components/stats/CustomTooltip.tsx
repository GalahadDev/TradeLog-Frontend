interface TooltipPayloadItem {
  name: string;
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

export const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-card/95 backdrop-blur-md border border-border/50 rounded-lg p-3 shadow-xl">
      <p className="text-sm font-medium text-foreground mb-1">{label || payload[0].name}</p>
      <p className="text-sm text-muted-foreground font-mono">
        {payload[0].name.includes('Rate') || payload[0].name.includes('%')
          ? `${payload[0].value}%`
          : payload[0].value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
      </p>
    </div>
  );
};
