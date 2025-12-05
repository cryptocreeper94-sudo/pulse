import { useState, useEffect } from 'react';
import { ScrollView, View, Text, Image, StyleSheet, TouchableOpacity, Animated, Dimensions, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import type { Coin } from '../src/config/coins';
import { COINS, getFeaturedCoin, getCoinsByCategory } from '../src/config/coins';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const coinImages: { [key: string]: any } = {
  'soldump': require('../src/assets/coins/soldump.jpg'),
  'love-united': require('../src/assets/coins/love-united.jpg'),
  'yahu-yahusha': require('../src/assets/coins/yahu-yahusha.jpg'),
  'yah-yahuah': require('../src/assets/coins/yah-yahuah.jpg'),
  'rhodi-rhodium': require('../src/assets/coins/rhodi-rhodium.jpg'),
  'jh25-justice': require('../src/assets/coins/jh25-justice.jpg'),
  'obey-illuminati': require('../src/assets/coins/obey-illuminati.jpg'),
  'v25-vertigo': require('../src/assets/coins/v25-vertigo.jpg'),
  'cheers-pumpaholic': require('../src/assets/coins/cheers-pumpaholic.jpg'),
  'p25-pumpocracy': require('../src/assets/coins/p25-pumpocracy.jpg'),
  'rektmeow-liquidation': require('../src/assets/coins/rektmeow-liquidation.jpg'),
  'uncat-uncertainty': require('../src/assets/coins/uncat-uncertainty.jpg'),
  'grimcat-halloween': require('../src/assets/coins/grimcat-halloween.jpg'),
  'ccat-cryptocat': require('../src/assets/coins/ccat-cryptocat.jpg'),
  'cwc-catwifcash': require('../src/assets/coins/cwc-catwifcash.png')
};

const getImage = (imagePath: string) => {
  return coinImages[imagePath] || null;
};

interface MenuItemProps {
  icon: string;
  label: string;
  isActive?: boolean;
  onPress: () => void;
  isLogout?: boolean;
}

function MenuItem({ icon, label, isActive, onPress, isLogout }: MenuItemProps) {
  return (
    <TouchableOpacity 
      style={[
        styles.menuItem, 
        isActive && styles.menuItemActive,
        isLogout && styles.menuItemLogout
      ]} 
      onPress={onPress}
    >
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  hasGauge?: boolean;
}

function MetricCard({ title, value, change, isPositive, hasGauge }: MetricCardProps) {
  return (
    <TouchableOpacity style={styles.metricCard}>
      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={[styles.metricValue, hasGauge ? styles.metricValueWhite : styles.metricValueGreen]}>
        {value}
      </Text>
      {change && (
        <Text style={[styles.metricChange, isPositive ? styles.changePositive : styles.changeNegative]}>
          {change}
        </Text>
      )}
      {hasGauge && (
        <View style={styles.gaugeContainer}>
          <View style={styles.gaugePlaceholder}>
            <Text style={styles.gaugeText}>Gauge</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('markets');
  const slideAnim = useState(new Animated.Value(-280))[0];
  
  const featuredCoin = getFeaturedCoin();
  const spiritualCoins = getCoinsByCategory('spiritual');
  const conspiracyCoins = getCoinsByCategory('conspiracy');
  const memeCoins = getCoinsByCategory('meme');

  const toggleMenu = () => {
    const toValue = menuOpen ? -280 : 0;
    Animated.timing(slideAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setMenuOpen(!menuOpen);
  };

  const selectTab = (tab: string) => {
    setActiveTab(tab);
    toggleMenu();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Slim Header */}
      <View style={styles.slimHeader}>
        <TouchableOpacity style={styles.hamburgerBtn} onPress={toggleMenu}>
          <View style={styles.hamburgerLine} />
          <View style={styles.hamburgerLine} />
          <View style={styles.hamburgerLine} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PULSE</Text>
        <View style={styles.versionBadge}>
          <Text style={styles.versionText}>v2.0</Text>
        </View>
      </View>

      {/* Hamburger Menu Overlay */}
      {menuOpen && (
        <TouchableOpacity 
          style={styles.menuOverlay} 
          activeOpacity={1} 
          onPress={toggleMenu}
        />
      )}

      {/* Hamburger Menu */}
      <Animated.View style={[styles.hamburgerMenu, { transform: [{ translateX: slideAnim }] }]}>
        <View style={styles.menuContent}>
          <Text style={styles.menuSectionTitle}>Navigation</Text>
          <MenuItem icon="📊" label="Markets" isActive={activeTab === 'markets'} onPress={() => selectTab('markets')} />
          <MenuItem icon="🚀" label="Projects" isActive={activeTab === 'projects'} onPress={() => selectTab('projects')} />
          <MenuItem icon="💡" label="Learn" isActive={activeTab === 'learn'} onPress={() => selectTab('learn')} />
          <MenuItem icon="📈" label="Portfolio" isActive={activeTab === 'portfolio'} onPress={() => selectTab('portfolio')} />
          <MenuItem icon="💎" label="Staking" isActive={activeTab === 'staking'} onPress={() => selectTab('staking')} />
          <MenuItem icon="⚙️" label="Settings" isActive={activeTab === 'settings'} onPress={() => selectTab('settings')} />
          <MenuItem icon="📅" label="V2 Details" isActive={activeTab === 'v2'} onPress={() => selectTab('v2')} />
          
          <Text style={[styles.menuSectionTitle, { marginTop: 20 }]}>Quick Actions</Text>
          <MenuItem icon="👤" label="Agent Builder" onPress={toggleMenu} />
          <MenuItem icon="🎨" label="Change Theme" onPress={toggleMenu} />
          <MenuItem icon="🐛" label="Report Bug" onPress={toggleMenu} />
          <MenuItem icon="⚠️" label="Disclaimer" onPress={toggleMenu} />
          <MenuItem icon="🚪" label="Logout" isLogout onPress={toggleMenu} />
          
          <View style={styles.menuFooter}>
            <Text style={styles.menuFooterText}>Beta V1 - Founders Launch Dec 25</Text>
          </View>
        </View>
      </Animated.View>

      {/* Main Content */}
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        style={styles.mainScroll}
      >
        {/* Metric Cards Grid */}
        <View style={styles.metricsGrid}>
          <MetricCard 
            title="FEAR & GREED INDEX" 
            value="65" 
            hasGauge 
          />
          <MetricCard 
            title="ALTCOIN SEASON INDEX" 
            value="75" 
            hasGauge 
          />
          <MetricCard 
            title="TOTAL MARKET CAP" 
            value="$3.07T" 
            change="+1.5%" 
            isPositive 
          />
          <MetricCard 
            title="24H TRADING VOLUME" 
            value="$136.5B" 
            change="-1.5%" 
            isPositive={false} 
          />
        </View>

        {/* Featured Coin */}
        <LinearGradient
          colors={['#FF006E', '#FFB703']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.featuredContainer}
        >
          <Text style={styles.featuredLabel}>FEATURED</Text>
          {getImage(featuredCoin.imagePath) && (
            <Image source={getImage(featuredCoin.imagePath)} style={styles.featuredImage} />
          )}
          <Text style={styles.featuredTicker}>{featuredCoin.ticker}</Text>
          <Text style={styles.featuredName}>{featuredCoin.name}</Text>
          <TouchableOpacity style={styles.buyButton}>
            <Text style={styles.buyButtonText}>BUY NOW</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Spiritual Section */}
        {spiritualCoins.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✨ Spiritual & Unity</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.coinsScroll}>
              {spiritualCoins.map(coin => (
                <CoinCard key={coin.id} coin={coin} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Conspiracy Section */}
        {conspiracyCoins.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👁️ Conspiracy & Mystery</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.coinsScroll}>
              {conspiracyCoins.map(coin => (
                <CoinCard key={coin.id} coin={coin} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Meme Section */}
        {memeCoins.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎪 Meme & Degen</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.coinsScroll}>
              {memeCoins.map(coin => (
                <CoinCard key={coin.id} coin={coin} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Footer Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

interface CoinCardProps {
  coin: Coin;
}

function CoinCard({ coin }: CoinCardProps) {
  return (
    <TouchableOpacity style={styles.coinCard}>
      <View style={styles.coinCardInner}>
        {getImage(coin.imagePath) && (
          <Image source={getImage(coin.imagePath)} style={styles.coinImage} />
        )}
        <Text style={styles.coinTicker}>{coin.ticker}</Text>
        <Text style={styles.coinName}>{coin.name}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a'
  },
  
  slimHeader: {
    height: 56,
    backgroundColor: '#0a0a0a',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    zIndex: 100,
    elevation: 5,
  },
  hamburgerBtn: {
    width: 40,
    height: 40,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  hamburgerLine: {
    width: 20,
    height: 2,
    backgroundColor: '#8FE9FF',
    borderRadius: 1,
    marginVertical: 2,
  },
  headerTitle: {
    fontFamily: 'Orbitron',
    fontSize: 22,
    fontWeight: '700',
    color: '#00d9ff',
    letterSpacing: 4,
    textShadowColor: 'rgba(0, 217, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  versionBadge: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  versionText: {
    fontSize: 12,
    color: '#666',
  },

  menuOverlay: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 98,
  },

  hamburgerMenu: {
    position: 'absolute',
    top: 56,
    left: 0,
    bottom: 0,
    width: 280,
    backgroundColor: '#0f0f0f',
    borderRightWidth: 1,
    borderRightColor: '#222',
    zIndex: 99,
    elevation: 4,
  },
  menuContent: {
    padding: 16,
  },
  menuSectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    marginBottom: 6,
  },
  menuItemActive: {
    backgroundColor: '#1a2a4a',
    borderColor: '#3861FB',
  },
  menuItemLogout: {
    borderColor: '#442222',
  },
  menuIcon: {
    fontSize: 18,
    width: 28,
    textAlign: 'center',
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ccc',
    marginLeft: 8,
  },
  menuLabelActive: {
    color: '#8FE9FF',
  },
  menuFooter: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  menuFooterText: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },

  mainScroll: {
    flex: 1,
    marginTop: 56,
  },
  scrollContent: {
    paddingBottom: 20,
    paddingTop: 8,
  },

  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    gap: 8,
  },
  metricCard: {
    width: (SCREEN_WIDTH - 24) / 2,
    backgroundColor: '#141414',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    padding: 12,
    alignItems: 'center',
    minHeight: 120,
  },
  metricTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8FE9FF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 38,
  },
  metricValueWhite: {
    color: '#ffffff',
  },
  metricValueGreen: {
    color: '#00FF41',
  },
  metricChange: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  changePositive: {
    color: '#00FF41',
  },
  changeNegative: {
    color: '#ff4444',
  },
  gaugeContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 8,
  },
  gaugePlaceholder: {
    width: '80%',
    height: 30,
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gaugeText: {
    fontSize: 10,
    color: '#666',
  },

  featuredContainer: {
    marginHorizontal: 15,
    marginVertical: 20,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFB703'
  },
  featuredLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    opacity: 0.8,
    letterSpacing: 2
  },
  featuredImage: {
    width: 180,
    height: 180,
    borderRadius: 12,
    marginVertical: 15
  },
  featuredTicker: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1
  },
  featuredName: {
    fontSize: 16,
    color: '#fff',
    marginTop: 5,
    opacity: 0.9
  },
  buyButton: {
    marginTop: 15,
    backgroundColor: '#FF006E',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff'
  },
  buyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1
  },
  section: {
    marginVertical: 15
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00d9ff',
    marginLeft: 20,
    marginBottom: 12,
    letterSpacing: 1
  },
  coinsScroll: {
    paddingHorizontal: 15
  },
  coinCard: {
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden'
  },
  coinCardInner: {
    width: 140,
    backgroundColor: '#141414',
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 12,
  },
  coinImage: {
    width: 100,
    height: 100,
    borderRadius: 8
  },
  coinTicker: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00d9ff',
    marginTop: 8,
    letterSpacing: 1
  },
  coinName: {
    fontSize: 11,
    color: '#aaa',
    marginTop: 4,
    textAlign: 'center'
  }
});
