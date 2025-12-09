import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Target, Zap, Users, Award, Sparkles, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

export type AchievementType = 
  | "first_project"
  | "first_standup"
  | "team_player"
  | "sprint_master"
  | "perfect_week"
  | "early_adopter"
  | "power_user"
  | "champion";

interface Achievement {
  id: AchievementType;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

const achievements: Record<AchievementType, Achievement> = {
  first_project: {
    id: "first_project",
    title: "Getting Started",
    description: "Created your first project",
    icon: Target,
    color: "text-blue-500",
    rarity: "common"
  },
  first_standup: {
    id: "first_standup",
    title: "Daily Dedication",
    description: "Completed your first standup",
    icon: Star,
    color: "text-yellow-500",
    rarity: "common"
  },
  team_player: {
    id: "team_player",
    title: "Team Player",
    description: "Added 5+ team members",
    icon: Users,
    color: "text-green-500",
    rarity: "rare"
  },
  sprint_master: {
    id: "sprint_master",
    title: "Sprint Master",
    description: "Completed 5 sprints",
    icon: Zap,
    color: "text-purple-500",
    rarity: "rare"
  },
  perfect_week: {
    id: "perfect_week",
    title: "Perfect Week",
    description: "100% standup participation for a week",
    icon: Trophy,
    color: "text-orange-500",
    rarity: "epic"
  },
  early_adopter: {
    id: "early_adopter",
    title: "Early Adopter",
    description: "Joined during beta",
    icon: Sparkles,
    color: "text-pink-500",
    rarity: "epic"
  },
  power_user: {
    id: "power_user",
    title: "Power User",
    description: "Used all platform features",
    icon: Award,
    color: "text-cyan-500",
    rarity: "epic"
  },
  champion: {
    id: "champion",
    title: "Agile Champion",
    description: "Master of the platform",
    icon: Crown,
    color: "text-amber-500",
    rarity: "legendary"
  }
};

interface AchievementBadgeProps {
  type: AchievementType;
  size?: "sm" | "md" | "lg";
  showDescription?: boolean;
  unlocked?: boolean;
}

export const AchievementBadge = ({ 
  type, 
  size = "md", 
  showDescription = false,
  unlocked = true 
}: AchievementBadgeProps) => {
  const achievement = achievements[type];
  const Icon = achievement.icon;

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16"
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };

  const rarityColors = {
    common: "from-gray-400 to-gray-600",
    rare: "from-blue-400 to-blue-600",
    epic: "from-purple-400 to-purple-600",
    legendary: "from-amber-400 to-amber-600"
  };

  return (
    <div className={cn(
      "flex items-center gap-3",
      !unlocked && "opacity-40 grayscale"
    )}>
      <div className={cn(
        "rounded-full bg-gradient-to-br flex items-center justify-center shadow-lg relative",
        sizeClasses[size],
        unlocked ? rarityColors[achievement.rarity] : "from-gray-300 to-gray-400"
      )}>
        <Icon className={cn(iconSizes[size], "text-primary-foreground")} />
        {unlocked && achievement.rarity === "legendary" && (
          <div className="absolute inset-0 rounded-full animate-pulse bg-amber-400/20" />
        )}
      </div>

      {showDescription && (
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm">{achievement.title}</p>
            <Badge variant={unlocked ? "default" : "outline"} className="text-xs">
              {achievement.rarity}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{achievement.description}</p>
        </div>
      )}
    </div>
  );
};

// Export achievements list for use in other components
export const getAllAchievements = () => Object.values(achievements);
