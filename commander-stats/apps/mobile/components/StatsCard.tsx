import { View, Text } from 'react-native';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  highlight?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'accent';
}

const colorClasses: Record<string, string> = {
  default: 'text-white',
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
  accent: 'text-accent',
};

const sizeClasses: Record<string, string> = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-4xl',
};

export function StatsCard({
  title,
  value,
  subtitle,
  highlight = false,
  size = 'md',
  color = 'primary',
}: StatsCardProps) {
  return (
    <View
      className={`rounded-xl p-4 border ${
        highlight
          ? 'bg-primary/10 border-primary/30'
          : 'bg-card border-card-border'
      }`}
    >
      <Text className="text-text-muted text-xs uppercase tracking-wider mb-1">{title}</Text>
      <Text className={`font-black ${sizeClasses[size]} ${colorClasses[color]}`}>
        {String(value)}
      </Text>
      {subtitle ? (
        <Text className="text-text-secondary text-xs mt-1">{subtitle}</Text>
      ) : null}
    </View>
  );
}

interface WinRateBarProps {
  winRate: number;
  totalGames: number;
  wins: number;
  showNumbers?: boolean;
}

export function WinRateBar({ winRate, totalGames, wins, showNumbers = true }: WinRateBarProps) {
  const percentage = totalGames > 0 ? Math.round(winRate * 100) : 0;

  if (totalGames === 0) {
    return (
      <View>
        <Text className="text-text-muted text-sm">N/A</Text>
      </View>
    );
  }

  return (
    <View>
      {showNumbers && (
        <View className="flex-row justify-between mb-1">
          <Text className="text-text-secondary text-xs">{wins}W / {totalGames - wins}L</Text>
          <Text className="text-white text-xs font-semibold">{percentage}%</Text>
        </View>
      )}
      <View className="h-2 bg-card-border rounded-full overflow-hidden">
        <View
          className={`h-full rounded-full ${percentage >= 50 ? 'bg-success' : 'bg-primary'}`}
          style={{ width: `${percentage}%` }}
        />
      </View>
    </View>
  );
}
