import express, { Request, Response } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import axios from 'axios';
import * as cheerio from 'cheerio';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

interface SleeperPlayer {
  player_id: string;
  full_name: string;
  fantasy_positions: string[];
  team: string;
  age: number;
  status: string;
  active: boolean;
}

interface PFRPlayer {
  name: string;
  team: string;
  position: string;
  age: string;
  games: string;
  gamesStarted: string;
  season: string;
}

interface CombinedPlayerData {
  sleeperId: string;
  name: string;
  team: string;
  position: string;
  age: string;
  status: string;
  active: boolean;
  // PFR Stats
  games?: string;
  gamesStarted?: string;
  season?: string;
}

// Helper function to normalize team abbreviations
const normalizeTeamAbbr = (team: string | undefined): string => {
  if (!team) return '';  // Return empty string for undefined/null teams
  
  const teamMappings: { [key: string]: string } = {
    // AFC East
    'BUF': 'BUF', // Buffalo Bills
    'MIA': 'MIA', // Miami Dolphins
    'NE': 'NWE',  // New England Patriots
    'NEP': 'NWE',
    'NWE': 'NWE',
    'NYJ': 'NYJ', // New York Jets
    
    // AFC North
    'BAL': 'BAL', // Baltimore Ravens
    'CIN': 'CIN', // Cincinnati Bengals
    'CLE': 'CLE', // Cleveland Browns
    'PIT': 'PIT', // Pittsburgh Steelers
    
    // AFC South
    'HOU': 'HOU', // Houston Texans
    'HTX': 'HOU',
    'IND': 'IND', // Indianapolis Colts
    'JAX': 'JAC', // Jacksonville Jaguars
    'JAC': 'JAC',
    'TEN': 'TEN', // Tennessee Titans
    'OTI': 'TEN',
    
    // AFC West
    'DEN': 'DEN', // Denver Broncos
    'KC': 'KAN',  // Kansas City Chiefs
    'KAN': 'KAN',
    'LV': 'LVR',  // Las Vegas Raiders
    'LVR': 'LVR',
    'LAS': 'LVR',
    'OAK': 'LVR',
    'LAC': 'LAC', // Los Angeles Chargers
    'SDG': 'LAC', // Former San Diego
    
    // NFC East
    'DAL': 'DAL', // Dallas Cowboys
    'NYG': 'NYG', // New York Giants
    'PHI': 'PHI', // Philadelphia Eagles
    'WAS': 'WAS', // Washington Commanders
    'WSH': 'WAS',
    
    // NFC North
    'CHI': 'CHI', // Chicago Bears
    'DET': 'DET', // Detroit Lions
    'GB': 'GNB',  // Green Bay Packers
    'GNB': 'GNB',
    'MIN': 'MIN', // Minnesota Vikings
    
    // NFC South
    'ATL': 'ATL', // Atlanta Falcons
    'CAR': 'CAR', // Carolina Panthers
    'NO': 'NOR',  // New Orleans Saints
    'NOR': 'NOR',
    'TB': 'TAM',  // Tampa Bay Buccaneers
    'TAM': 'TAM',
    'TBB': 'TAM',
    
    // NFC West
    'ARI': 'ARI', // Arizona Cardinals
    'CRD': 'ARI',
    'LA': 'LAR',  // Los Angeles Rams
    'LAR': 'LAR',
    'STL': 'LAR', // Former St. Louis
    'SF': 'SFO',  // San Francisco 49ers
    'SFO': 'SFO',
    'SEA': 'SEA'  // Seattle Seahawks
  };
  
  // Return mapped value or original if no mapping exists
  return teamMappings[team.toUpperCase()] || team;
};

// Helper function to normalize player names
const normalizePlayerName = (name: string | undefined): string => {
  if (!name) return '';  // Return empty string for undefined/null names
  
  return name.toLowerCase()
    .replace(/\./g, '')
    .replace(/jr$|sr$|ii$|iii$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
};

app.use(cors());
app.use(express.json());

// Combined endpoint to get matched player data
app.get('/api/players/:season?', async (req: Request, res: Response) => {
  try {
    const season = req.params.season || '2024';
    console.log(`Fetching and matching player data for ${season} season...`);

    // Fetch Sleeper players
    const sleeperResponse = await axios.get('https://api.sleeper.app/v1/players/nfl');
    const sleeperPlayers = Object.values(sleeperResponse.data) as SleeperPlayer[];
    
    // Filter active players
    const activeSleeperPlayers = sleeperPlayers.filter(p => p.active && p.team);

    // Fetch PFR players
    const pfrResponse = await axios.get(`https://www.pro-football-reference.com/years/${season}/fantasy.htm`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    const $ = cheerio.load(pfrResponse.data);
    const pfrPlayers: PFRPlayer[] = [];

    $('table#fantasy tbody tr').each((i, elem) => {
      if (!$(elem).hasClass('thead') && !$(elem).hasClass('over_header') && !$(elem).hasClass('norank')) {
        const name = $(elem).find('td[data-stat="player"] a').text().trim();
        const team = $(elem).find('td[data-stat="team"]').text().trim();
        const position = $(elem).find('td[data-stat="fantasy_pos"]').text().trim();
        
        if (name && team && position) {
          pfrPlayers.push({
            name,
            team,
            position,
            age: $(elem).find('td[data-stat="age"]').text().trim(),
            games: $(elem).find('td[data-stat="g"]').text().trim(),
            gamesStarted: $(elem).find('td[data-stat="gs"]').text().trim(),
            season: season.toString()
          });
        }
      }
    });

    // Match players and combine data
    const combinedPlayers: CombinedPlayerData[] = activeSleeperPlayers.map(sleeperPlayer => {
      const normalizedSleeperName = normalizePlayerName(sleeperPlayer.full_name);
      const normalizedSleeperTeam = normalizeTeamAbbr(sleeperPlayer.team);

      const pfrPlayer = pfrPlayers.find(pfrPlayer => {
        const normalizedPfrName = normalizePlayerName(pfrPlayer.name);
        const normalizedPfrTeam = normalizeTeamAbbr(pfrPlayer.team);
        
        return normalizedPfrName === normalizedSleeperName && 
               normalizedPfrTeam === normalizedSleeperTeam;
      });

      return {
        sleeperId: sleeperPlayer.player_id,
        name: sleeperPlayer.full_name,
        team: sleeperPlayer.team,
        position: sleeperPlayer.fantasy_positions[0],
        age: pfrPlayer?.age || String(sleeperPlayer.age),
        status: sleeperPlayer.status,
        active: sleeperPlayer.active,
        // PFR Stats if available
        games: pfrPlayer?.games,
        gamesStarted: pfrPlayer?.gamesStarted,
        season
      };
    });

    // Sort by name
    const sortedPlayers = combinedPlayers.sort((a, b) => a.name.localeCompare(b.name));
    
    console.log(`Successfully matched ${sortedPlayers.length} players`);
    res.json(sortedPlayers);

  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText
    });
    
    res.status(500).json({
      error: 'Failed to fetch and match player data',
      details: error.message
    });
  }
});

// Add this new endpoint after the existing ones
app.get('/api/sleeper/players', async (req: Request, res: Response) => {
  try {
    console.log('Fetching Sleeper players...');
    
    // Fetch Sleeper players
    const sleeperResponse = await axios.get('https://api.sleeper.app/v1/players/nfl');
    
    // Debug log
    console.log('Sleeper response received:', {
      status: sleeperResponse.status,
      dataType: typeof sleeperResponse.data,
      hasData: !!sleeperResponse.data
    });

    if (!sleeperResponse.data) {
      throw new Error('No data received from Sleeper API');
    }

    const sleeperPlayers = Object.values(sleeperResponse.data) as SleeperPlayer[];
    
    // Debug log
    console.log('Players extracted:', {
      totalPlayers: sleeperPlayers.length,
      samplePlayer: sleeperPlayers[0]
    });

    // Filter active players with more validation
    const activeSleeperPlayers = sleeperPlayers.filter(p => 
      p && 
      p.active && 
      p.team && 
      p.full_name // Make sure we have a name to sort by
    );

    // Debug log
    console.log('Active players filtered:', {
      totalActive: activeSleeperPlayers.length,
      sampleActive: activeSleeperPlayers[0]
    });

    // Sort by name with null check
    const sortedPlayers = [...activeSleeperPlayers].sort((a, b) => {
      if (!a?.full_name) return 1;
      if (!b?.full_name) return -1;
      return a.full_name.localeCompare(b.full_name);
    });
    
    console.log(`Found ${sortedPlayers.length} active Sleeper players`);
    res.json(sortedPlayers);

  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      response: error.response?.data,
      stack: error.stack
    });
    
    res.status(500).json({
      error: 'Failed to fetch Sleeper players',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Add this new endpoint to check PFR data
app.get('/api/pfr/players/:season?', async (req: Request, res: Response) => {
  try {
    const season = req.params.season || '2024';
    console.log(`Fetching PFR players for ${season} season...`);
    
    const response = await axios.get(`https://www.pro-football-reference.com/years/${season}/fantasy.htm`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    const $ = cheerio.load(response.data);
    const pfrPlayers: PFRPlayer[] = [];

    // Debug: Log table presence
    console.log('Found fantasy table:', $('#fantasy').length > 0);

    $('table#fantasy tbody tr').each((i, elem) => {
      if (!$(elem).hasClass('thead') && !$(elem).hasClass('over_header') && !$(elem).hasClass('norank')) {
        const name = $(elem).find('td[data-stat="player"] a').text().trim();
        const team = $(elem).find('td[data-stat="team"]').text().trim();
        const position = $(elem).find('td[data-stat="fantasy_pos"]').text().trim();
        
        if (name && team && position) {
          pfrPlayers.push({
            name,
            team,
            position,
            age: $(elem).find('td[data-stat="age"]').text().trim(),
            games: $(elem).find('td[data-stat="g"]').text().trim(),
            gamesStarted: $(elem).find('td[data-stat="gs"]').text().trim(),
            season: season.toString()
          });
        }
      }
    });

    if (pfrPlayers.length === 0) {
      // Log the HTML content to see what we're getting
      console.log('HTML Sample:', response.data.substring(0, 1000));
      throw new Error(`No PFR player data found for ${season} season`);
    }

    // Sort by name
    const sortedPlayers = pfrPlayers.sort((a, b) => a.name.localeCompare(b.name));
    
    console.log(`Successfully scraped ${sortedPlayers.length} PFR players for ${season} season`);
    res.json(sortedPlayers);

  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      html: error.response?.data?.substring(0, 500)
    });
    
    res.status(500).json({
      error: 'Failed to fetch PFR players',
      details: error.message
    });
  }
});

// Add this new endpoint to check player mapping
app.get('/api/mapping/debug/:season?', async (req: Request, res: Response) => {
  try {
    const season = req.params.season || '2024';
    console.log(`Checking player mapping for ${season} season...`);

    // Fetch both data sources
    const [sleeperResponse, pfrResponse] = await Promise.all([
      axios.get('https://api.sleeper.app/v1/players/nfl'),
      axios.get(`https://www.pro-football-reference.com/years/${season}/fantasy.htm`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      })
    ]);

    // Process Sleeper data
    const sleeperPlayers = Object.values(sleeperResponse.data) as SleeperPlayer[];
    const activeSleeperPlayers = sleeperPlayers.filter(p => p.active && p.team);

    // Process PFR data
    const $ = cheerio.load(pfrResponse.data);
    const pfrPlayers: PFRPlayer[] = [];

    $('table#fantasy tbody tr').each((i, elem) => {
      if (!$(elem).hasClass('thead') && !$(elem).hasClass('over_header') && !$(elem).hasClass('norank')) {
        const name = $(elem).find('td[data-stat="player"] a').text().trim();
        const team = $(elem).find('td[data-stat="team"]').text().trim();
        const position = $(elem).find('td[data-stat="fantasy_pos"]').text().trim();
        
        if (name && team && position) {
          pfrPlayers.push({
            name,
            team,
            position,
            age: $(elem).find('td[data-stat="age"]').text().trim(),
            games: $(elem).find('td[data-stat="g"]').text().trim(),
            gamesStarted: $(elem).find('td[data-stat="gs"]').text().trim(),
            season: season.toString()
          });
        }
      }
    });

    // Track mapping results
    const mappingResults = {
      matched: [] as any[],
      unmatched: [] as any[],
      stats: {
        totalSleeper: activeSleeperPlayers.length,
        totalPFR: pfrPlayers.length,
        matched: 0,
        unmatched: 0
      }
    };

    // Check each Sleeper player
    activeSleeperPlayers.forEach(sleeperPlayer => {
      if (!sleeperPlayer.full_name || !sleeperPlayer.team) {
        mappingResults.unmatched.push({
          player: sleeperPlayer.full_name || 'Unknown',
          team: sleeperPlayer.team || 'Unknown',
          normalizedName: '',
          normalizedTeam: '',
          reason: 'Missing name or team in Sleeper data'
        });
        mappingResults.stats.unmatched++;
        return;
      }

      const normalizedSleeperName = normalizePlayerName(sleeperPlayer.full_name);
      const normalizedSleeperTeam = normalizeTeamAbbr(sleeperPlayer.team);

      const pfrPlayer = pfrPlayers.find(pfrPlayer => {
        if (!pfrPlayer.name || !pfrPlayer.team) return false;
        
        const normalizedPfrName = normalizePlayerName(pfrPlayer.name);
        const normalizedPfrTeam = normalizeTeamAbbr(pfrPlayer.team);
        
        return normalizedPfrName === normalizedSleeperName && 
               normalizedPfrTeam === normalizedSleeperTeam;
      });

      if (pfrPlayer) {
        mappingResults.matched.push({
          sleeper: {
            name: sleeperPlayer.full_name,
            team: sleeperPlayer.team,
            normalizedName: normalizedSleeperName,
            normalizedTeam: normalizedSleeperTeam
          },
          pfr: {
            name: pfrPlayer.name,
            team: pfrPlayer.team,
            normalizedName: normalizePlayerName(pfrPlayer.name),
            normalizedTeam: normalizeTeamAbbr(pfrPlayer.team)
          }
        });
        mappingResults.stats.matched++;
      } else {
        mappingResults.unmatched.push({
          player: sleeperPlayer.full_name,
          team: sleeperPlayer.team,
          normalizedName: normalizedSleeperName,
          normalizedTeam: normalizedSleeperTeam,
          reason: 'No matching PFR player found'
        });
        mappingResults.stats.unmatched++;
      }
    });

    console.log('Mapping stats:', mappingResults.stats);
    res.json(mappingResults);

  } catch (error) {
    console.error('Error checking mapping:', error);
    res.status(500).json({
      error: 'Failed to check player mapping',
      details: error.message
    });
  }
});

// Start server with error handling
const PORT = Number(process.env.PORT) || 5001;
let retryCount = 0;
const maxRetries = 3;

const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    if (error.code === 'EADDRINUSE' && retryCount < maxRetries) {
      console.log(`Port ${PORT} is busy, trying ${PORT + 1}...`);
      retryCount++;
      const newPort = PORT + retryCount;
      app.listen(newPort, () => {
        console.log(`Server running on alternate port ${newPort}`);
      });
    } else {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }
};

startServer();