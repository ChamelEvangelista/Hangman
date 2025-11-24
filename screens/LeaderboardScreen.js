// screens/LeaderboardScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { UserService, ScoreService } from '../services/DatabaseService';
import { useUser } from '../contexts/UserContext';

export default function LeaderboardScreen({ navigation }) {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('global'); // 'global', 'scores', 'personal'
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [scoreData, setScoreData] = useState([]);
  const [personalStats, setPersonalStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    loadData();
    startAnimations();
  }, [activeTab]);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start();
  };

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'global':
          const globalData = await UserService.getLeaderboard(20);
          setLeaderboardData(globalData);
          break;
        case 'scores':
          const scoresData = await ScoreService.getLeaderboard(null, 15);
          setScoreData(scoresData);
          break;
        case 'personal':
          if (user) {
            const userStats = await UserService.getUserByEmail(user.email);
            setPersonalStats(userStats);
          }
          break;
      }
    } catch (error) {
      console.error('Error loading leaderboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const renderRankBadge = (rank) => {
    let badgeStyle = styles.rankBadge;
    let badgeText = `${rank}`;

    if (rank === 1) {
      badgeStyle = { ...badgeStyle, ...styles.goldBadge };
      badgeText = '🥇';
    } else if (rank === 2) {
      badgeStyle = { ...badgeStyle, ...styles.silverBadge };
      badgeText = '🥈';
    } else if (rank === 3) {
      badgeStyle = { ...badgeStyle, ...styles.bronzeBadge };
      badgeText = '🥉';
    }

    return (
      <View style={badgeStyle}>
        <Text style={styles.rankText}>{badgeText}</Text>
      </View>
    );
  };

  const renderGlobalLeaderboard = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f59e0b" />
          <Text style={styles.loadingText}>Loading leaderboard...</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.listContainer}>
        {leaderboardData.map((player, index) => (
          <Animated.View 
            key={player.username}
            style={[
              styles.leaderboardItem,
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }] 
              }
            ]}
          >
            <View style={styles.rankContainer}>
              {renderRankBadge(index + 1)}
            </View>
            
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>
                {player.username}
                {user && player.username === user.username && ' (You)'}
              </Text>
              <Text style={styles.playerDetails}>
                {player.games_played} games • {player.games_won} wins
              </Text>
            </View>
            
            <View style={styles.scoreContainer}>
              <Text style={styles.score}>{player.score.toLocaleString()}</Text>
              <Text style={styles.winRatio}>
                {player.win_ratio ? `${(player.win_ratio * 100).toFixed(1)}%` : '0%'}
              </Text>
            </View>
          </Animated.View>
        ))}
        
        {leaderboardData.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No players yet!</Text>
            <Text style={styles.emptyStateSubtext}>Play some games to appear on the leaderboard.</Text>
          </View>
        )}
      </ScrollView>
    );
  };

  const renderScoresLeaderboard = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f59e0b" />
          <Text style={styles.loadingText}>Loading scores...</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.listContainer}>
        {scoreData.map((score, index) => (
          <Animated.View 
            key={`${score.player_name}-${score.id}-${index}`}
            style={[
              styles.scoreItem,
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }] 
              }
            ]}
          >
            <View style={styles.scoreRank}>
              {renderRankBadge(index + 1)}
            </View>
            
            <View style={styles.scoreInfo}>
              <Text style={styles.scorePlayer}>{score.player_name}</Text>
              <Text style={styles.scoreDifficulty}>{score.difficulty}</Text>
            </View>
            
            <View style={styles.scoreDetails}>
              <Text style={styles.scorePoints}>{score.score.toLocaleString()}</Text>
              <Text style={styles.scoreMeta}>
                {score.words_guessed} word{score.words_guessed !== 1 ? 's' : ''}
              </Text>
            </View>
          </Animated.View>
        ))}
        
        {scoreData.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No scores yet!</Text>
            <Text style={styles.emptyStateSubtext}>Complete games to see scores here.</Text>
          </View>
        )}
      </ScrollView>
    );
  };

  const renderPersonalStats = () => {
    if (!user) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Please log in to view personal stats</Text>
        </View>
      );
    }

    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f59e0b" />
          <Text style={styles.loadingText}>Loading your stats...</Text>
        </View>
      );
    }

    if (!personalStats) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No stats available</Text>
          <Text style={styles.emptyStateSubtext}>Play some games to see your statistics!</Text>
        </View>
      );
    }

    const winRatio = personalStats.games_played > 0 
      ? ((personalStats.games_won / personalStats.games_played) * 100).toFixed(1)
      : 0;

    return (
      <Animated.View 
        style={[
          styles.personalStats,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }] 
          }
        ]}
      >
        <View style={styles.statCard}>
          <Text style={styles.statCardTitle}>Overall Performance</Text>
          
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{personalStats.score || 0}</Text>
              <Text style={styles.statLabel}>Total Score</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{personalStats.games_played || 0}</Text>
              <Text style={styles.statLabel}>Games Played</Text>
            </View>
          </View>
          
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{personalStats.games_won || 0}</Text>
              <Text style={styles.statLabel}>Wins</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {personalStats.games_played ? (personalStats.games_played - personalStats.games_won) : 0}
              </Text>
              <Text style={styles.statLabel}>Losses</Text>
            </View>
          </View>
          
          <View style={styles.statRow}>
            <View style={[styles.statItem, { width: '100%' }]}>
              <Text style={styles.statNumber}>{winRatio}%</Text>
              <Text style={styles.statLabel}>Win Ratio</Text>
            </View>
          </View>
        </View>

        <View style={styles.achievementCard}>
          <Text style={styles.achievementTitle}>Your Achievements</Text>
          {personalStats.games_played === 0 && (
            <Text style={styles.achievementText}>🎯 Play your first game to unlock achievements!</Text>
          )}
          {personalStats.games_played > 0 && (
            <>
              {personalStats.games_won >= 1 && (
                <Text style={styles.achievementText}>🎉 First Win! You've won your first game!</Text>
              )}
              {personalStats.games_won >= 5 && (
                <Text style={styles.achievementText}>🏆 Winning Streak! 5 games won!</Text>
              )}
              {personalStats.score >= 1000 && (
                <Text style={styles.achievementText}>⭐ Score Master! Reached 1,000 points!</Text>
              )}
              {winRatio >= 50 && personalStats.games_played >= 10 && (
                <Text style={styles.achievementText}>💪 Consistent Player! 50%+ win ratio!</Text>
              )}
            </>
          )}
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Leaderboard</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'global' && styles.activeTab]}
          onPress={() => setActiveTab('global')}
        >
          <Text style={[styles.tabText, activeTab === 'global' && styles.activeTabText]}>
            Global
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'scores' && styles.activeTab]}
          onPress={() => setActiveTab('scores')}
        >
          <Text style={[styles.tabText, activeTab === 'scores' && styles.activeTabText]}>
            Recent Scores
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'personal' && styles.activeTab]}
          onPress={() => setActiveTab('personal')}
        >
          <Text style={[styles.tabText, activeTab === 'personal' && styles.activeTabText]}>
            My Stats
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#f59e0b']}
          tintColor="#f59e0b"
        >
          {activeTab === 'global' && renderGlobalLeaderboard()}
          {activeTab === 'scores' && renderScoresLeaderboard()}
          {activeTab === 'personal' && renderPersonalStats()}
        </RefreshControl>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#1e293b',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#60a5fa',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#facc15',
  },
  headerRight: {
    width: 60,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#f59e0b',
  },
  tabText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#f59e0b',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#cbd5e1',
    marginTop: 10,
    fontSize: 16,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  rankContainer: {
    marginRight: 12,
  },
  scoreRank: {
    marginRight: 12,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  goldBadge: {
    backgroundColor: '#f59e0b',
  },
  silverBadge: {
    backgroundColor: '#94a3b8',
  },
  bronzeBadge: {
    backgroundColor: '#b45309',
  },
  rankText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  playerDetails: {
    color: '#94a3b8',
    fontSize: 12,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  score: {
    color: '#f59e0b',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  winRatio: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '600',
  },
  scoreInfo: {
    flex: 1,
  },
  scorePlayer: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  scoreDifficulty: {
    color: '#60a5fa',
    fontSize: 12,
    fontWeight: '500',
  },
  scoreDetails: {
    alignItems: 'flex-end',
  },
  scorePoints: {
    color: '#f59e0b',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  scoreMeta: {
    color: '#94a3b8',
    fontSize: 12,
  },
  personalStats: {
    flex: 1,
    padding: 16,
  },
  statCard: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  statCardTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    color: '#f59e0b',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 14,
  },
  achievementCard: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  achievementTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  achievementText: {
    color: '#e2e8f0',
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    color: '#cbd5e1',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});