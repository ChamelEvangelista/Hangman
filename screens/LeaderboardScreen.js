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
  ActivityIndicator,
  SafeAreaView
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
          <ActivityIndicator size="large" color="#584738" />
          <Text style={styles.loadingText}>Loading leaderboard...</Text>
        </View>
      );
    }

    return (
      <ScrollView 
        style={styles.listContainer}
        showsVerticalScrollIndicator={false}
      >
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
                {user && player.username === user.username && (
                  <Text style={styles.youBadge}> (You)</Text>
                )}
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
          <ActivityIndicator size="large" color="#584738" />
          <Text style={styles.loadingText}>Loading scores...</Text>
        </View>
      );
    }

    return (
      <ScrollView 
        style={styles.listContainer}
        showsVerticalScrollIndicator={false}
      >
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
          <ActivityIndicator size="large" color="#584738" />
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
      <ScrollView 
        style={styles.personalContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#584738']}
            tintColor="#584738"
          />
        }
      >
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
                  <Text style={styles.achievementText}>🎉 First Win! You have won your first game!</Text>
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
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
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
        {activeTab === 'global' && (
          <ScrollView 
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#584738']}
                tintColor="#584738"
              />
            }
          >
            {renderGlobalLeaderboard()}
          </ScrollView>
        )}
        {activeTab === 'scores' && (
          <ScrollView 
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#584738']}
                tintColor="#584738"
              />
            }
          >
            {renderScoresLeaderboard()}
          </ScrollView>
        )}
        {activeTab === 'personal' && renderPersonalStats()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1EADA', // Milk background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E2D9',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#584738', // Mahogany
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3D1F12', // Espresso
  },
  headerRight: {
    width: 60,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E2D9',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#584738', // Mahogany
  },
  tabText: {
    color: '#98755B', // Light brown
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#584738', // Mahogany
  },
  content: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  personalContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#584738', // Mahogany
    marginTop: 10,
    fontSize: 16,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E8E2D9',
  },
  scoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E8E2D9',
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
    backgroundColor: '#F8F4F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E2D9',
  },
  goldBadge: {
    backgroundColor: '#FFD700',
    borderColor: '#D4AF37',
  },
  silverBadge: {
    backgroundColor: '#C0C0C0',
    borderColor: '#A8A8A8',
  },
  bronzeBadge: {
    backgroundColor: '#CD7F32',
    borderColor: '#B08D57',
  },
  rankText: {
    color: '#3D1F12', // Espresso
    fontWeight: 'bold',
    fontSize: 12,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    color: '#3D1F12', // Espresso
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  youBadge: {
    color: '#584738', // Mahogany
    fontWeight: '500',
    fontStyle: 'italic',
  },
  playerDetails: {
    color: '#98755B', // Light brown
    fontSize: 12,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  score: {
    color: '#584738', // Mahogany
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  winRatio: {
    color: '#2E8B57', // Sea Green for positive
    fontSize: 12,
    fontWeight: '600',
  },
  scoreInfo: {
    flex: 1,
  },
  scorePlayer: {
    color: '#3D1F12', // Espresso
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  scoreDifficulty: {
    color: '#584738', // Mahogany
    fontSize: 12,
    fontWeight: '500',
  },
  scoreDetails: {
    alignItems: 'flex-end',
  },
  scorePoints: {
    color: '#584738', // Mahogany
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  scoreMeta: {
    color: '#98755B', // Light brown
    fontSize: 12,
  },
  personalStats: {
    padding: 16,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E8E2D9',
  },
  statCardTitle: {
    color: '#3D1F12', // Espresso
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
    color: '#584738', // Mahogany
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#98755B', // Light brown
    fontSize: 14,
  },
  achievementCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E8E2D9',
  },
  achievementTitle: {
    color: '#3D1F12', // Espresso
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  achievementText: {
    color: '#584738', // Mahogany
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
    color: '#584738', // Mahogany
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    color: '#98755B', // Light brown
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});