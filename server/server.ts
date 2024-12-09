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
  espn_id?: string;
  yahoo_id?: string;
  player_id_str?: string;
  position?: string;
  bye_week?: number;
}

interface PFRPlayer {
  name: string;
  team: string;
  position: string;
  age: string;
  games: string;
  gamesStarted: string;
  season: string;
  passingYards?: number;
  passingAttempts?: number;
  passingTouchdowns?: number;
  rushingYards?: number;
  rushingAttempts?: number;
  rushingTouchdowns?: number;
  receptions?: number;
  targets?: number;
  receivingYards?: number;
  receivingTouchdowns?: number;
  fieldGoalsMade?: number;
  fieldGoalsAttempted?: number;
  fieldGoalsUnder30?: number;
  fieldGoals30to39?: number;
  fieldGoals40to49?: number;
  fieldGoals50Plus?: number;
  extraPointsMade?: number;
  extraPointsAttempted?: number;
  pointsAllowed?: number;
  sacks?: number;
  interceptions?: number;
  fumbleRecoveries?: number;
  safeties?: number;
  defensiveTouchdowns?: number;
  specialTeamsTouchdowns?: number;
  blockedKicks?: number;
  forcedFumbles?: number;
  fieldGoalPercentage?: number;
  extraPointPercentage?: number;
}

interface CombinedPlayerData {
  sleeperId: string;
  name: string;
  team: string;
  position: string;
  age: string;
  status: string;
  active: boolean;
  espnAvatar?: string;
  yahooAvatar?: string;
  sleeperAvatar?: string;
  imageUrl?: string;
  byeWeek?: number;
  games?: string;
  gamesStarted?: string;
  season?: string;
  passingYards?: number;
  passingAttempts?: number;
  passingTouchdowns?: number;
  rushingYards?: number;
  rushingAttempts?: number;
  rushingTouchdowns?: number;
  receptions?: number;
  targets?: number;
  receivingYards?: number;
  receivingTouchdowns?: number;
  fieldGoalsMade?: number;
  fieldGoalsAttempted?: number;
  fieldGoalsUnder30?: number;
  fieldGoals30to39?: number;
  fieldGoals40to49?: number;
  fieldGoals50Plus?: number;
  extraPointsMade?: number;
  extraPointsAttempted?: number;
  pointsAllowed?: number;
  sacks?: number;
  interceptions?: number;
  fumbleRecoveries?: number;
  safeties?: number;
  defensiveTouchdowns?: number;
  specialTeamsTouchdowns?: number;
  blockedKicks?: number;
  forcedFumbles?: number;
  fieldGoalPercentage?: number;
  extraPointPercentage?: number;
}

// Add NFL team bye weeks for 2024 (official schedule)
const NFL_BYE_WEEKS: { [key: string]: number } = {
  'CLE': 5,  // Cleveland Browns
  'LAC': 5,  // Los Angeles Chargers
  'DET': 5,  // Detroit Lions
  'TB': 5,   // Tampa Bay Buccaneers
  'GB': 6,   // Green Bay Packers
  'PIT': 6,  // Pittsburgh Steelers
  'CAR': 7,  // Carolina Panthers
  'CIN': 7,  // Cincinnati Bengals
  'HOU': 7,  // Houston Texans
  'NYJ': 7,  // New York Jets
  'KC': 8,   // Kansas City Chiefs
  'DEN': 9,  // Denver Broncos
  'JAX': 9,  // Jacksonville Jaguars
  'LAR': 9,  // Los Angeles Rams
  'SF': 9,   // San Francisco 49ers
  'MIA': 10, // Miami Dolphins
  'PHI': 10, // Philadelphia Eagles
  'NE': 11,  // New England Patriots
  'NO': 11,  // New Orleans Saints
  'BAL': 13, // Baltimore Ravens
  'BUF': 13, // Buffalo Bills
  'CHI': 13, // Chicago Bears
  'LV': 13,  // Las Vegas Raiders
  'MIN': 13, // Minnesota Vikings
  'NYG': 13, // New York Giants
  'ARI': 14, // Arizona Cardinals
  'ATL': 14, // Atlanta Falcons
  'DAL': 14, // Dallas Cowboys
  'IND': 14, // Indianapolis Colts
  'SEA': 14, // Seattle Seahawks
  'TEN': 14, // Tennessee Titans
  'WAS': 14  // Washington Commanders
};

// Helper function to normalize team abbreviations
const normalizeTeamAbbr = (team: string | undefined): string => {
  if (!team) return '';
  
  const teamMappings: { [key: string]: string } = {
    // AFC East
    'BUF': 'BUF',
    'MIA': 'MIA',
    'NE': 'NE',
    'NEP': 'NE',
    'NWE': 'NE',
    'NYJ': 'NYJ',
    
    // AFC North
    'BAL': 'BAL',
    'CIN': 'CIN',
    'CLE': 'CLE',
    'PIT': 'PIT',
    
    // AFC South
    'HOU': 'HOU',
    'HTX': 'HOU',
    'IND': 'IND',
    'JAX': 'JAX',
    'JAC': 'JAX',
    'TEN': 'TEN',
    
    // AFC West
    'DEN': 'DEN',
    'KC': 'KC',
    'KAN': 'KC',
    'LV': 'LV',
    'LVR': 'LV',
    'LAS': 'LV',
    'OAK': 'LV',
    'LAC': 'LAC',
    'SDG': 'LAC',
    
    // NFC East
    'DAL': 'DAL',
    'NYG': 'NYG',
    'PHI': 'PHI',
    'WAS': 'WAS',
    
    // NFC North
    'CHI': 'CHI',
    'DET': 'DET',
    'GB': 'GB',
    'GNB': 'GB',
    'MIN': 'MIN',
    
    // NFC South
    'ATL': 'ATL',
    'CAR': 'CAR',
    'NO': 'NO',
    'NOR': 'NO',
    'TB': 'TB',
    'TAM': 'TB',
    'TBB': 'TB',
    
    // NFC West
    'ARI': 'ARI',
    'CRD': 'ARI',
    'LA': 'LAR',
    'LAR': 'LAR',
    'STL': 'LAR',
    'SF': 'SF',
    'SFO': 'SF',
    'SEA': 'SEA'
  };
  
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

// Add a constant for valid positions and team defense IDs
const VALID_POSITIONS = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'];
const TEAM_DEFENSE_IDS = {
  'ARI': 'ARI',
  'ATL': 'ATL',
  'BAL': 'BAL',
  'BUF': 'BUF',
  'CAR': 'CAR',
  'CHI': 'CHI',
  'CIN': 'CIN',
  'CLE': 'CLE',
  'DAL': 'DAL',
  'DEN': 'DEN',
  'DET': 'DET',
  'GB': 'GB',
  'HOU': 'HOU',
  'IND': 'IND',
  'JAX': 'JAX',
  'KC': 'KC',
  'LAC': 'LAC',
  'LAR': 'LAR',
  'LV': 'LV',
  'MIA': 'MIA',
  'MIN': 'MIN',
  'NE': 'NE',
  'NO': 'NO',
  'NYG': 'NYG',
  'NYJ': 'NYJ',
  'PHI': 'PHI',
  'PIT': 'PIT',
  'SEA': 'SEA',
  'SF': 'SF',
  'TB': 'TB',
  'TEN': 'TEN',
  'WAS': 'WAS'
};

const TEAM_NAMES = {
  'ARI': 'Arizona Cardinals',
  'ATL': 'Atlanta Falcons',
  'BAL': 'Baltimore Ravens',
  'BUF': 'Buffalo Bills',
  'CAR': 'Carolina Panthers',
  'CHI': 'Chicago Bears',
  'CIN': 'Cincinnati Bengals',
  'CLE': 'Cleveland Browns',
  'DAL': 'Dallas Cowboys',
  'DEN': 'Denver Broncos',
  'DET': 'Detroit Lions',
  'GB': 'Green Bay Packers',
  'HOU': 'Houston Texans',
  'IND': 'Indianapolis Colts',
  'JAX': 'Jacksonville Jaguars',
  'KC': 'Kansas City Chiefs',
  'LAC': 'Los Angeles Chargers',
  'LAR': 'Los Angeles Rams',
  'LV': 'Las Vegas Raiders',
  'MIA': 'Miami Dolphins',
  'MIN': 'Minnesota Vikings',
  'NE': 'New England Patriots',
  'NO': 'New Orleans Saints',
  'NYG': 'New York Giants',
  'NYJ': 'New York Jets',
  'PHI': 'Philadelphia Eagles',
  'PIT': 'Pittsburgh Steelers',
  'SEA': 'Seattle Seahawks',
  'SF': 'San Francisco 49ers',
  'TB': 'Tampa Bay Buccaneers',
  'TEN': 'Tennessee Titans',
  'WAS': 'Washington Commanders'
};

// Add this function to fetch NFL state data
const fetchNFLState = async () => {
  try {
    const response = await axios.get('https://api.sleeper.app/v1/state/nfl');
    console.log('NFL State:', response.data);  // Let's see what we get
    return response.data;
  } catch (error) {
    console.error('Error fetching NFL state:', error);
    return null;
  }
};

// Combined endpoint to get matched player data
app.get('/api/players/:season?', async (req: Request, res: Response) => {
  try {
    const season = req.params.season || '2024';
    console.log(`Fetching and matching player data for ${season} season...`);

    // Fetch Sleeper players, offensive stats, kicker stats, and NFL state
    const [sleeperResponse, offenseResponse, kickerResponse, nflState] = await Promise.all([
      axios.get('https://api.sleeper.app/v1/players/nfl'),
      axios.get(`https://www.pro-football-reference.com/years/${season}/fantasy.htm`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      }),
      axios.get(`https://www.pro-football-reference.com/years/${season}/kicking.htm`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      }),
      fetchNFLState()
    ]);

    // Fetch Sleeper players
    const sleeperPlayers = Object.values(sleeperResponse.data) as SleeperPlayer[];
    
    // Debug log to find team defenses in raw data
    console.log('Checking raw Sleeper data for defenses...');
    Object.entries(sleeperResponse.data).forEach(([id, player]: [string, any]) => {
      if (player.position === 'DEF' || player.fantasy_positions?.includes('DEF') || id.includes('DEF')) {
        console.log('Found potential defense:', {
          id,
          player_id: player.player_id,
          name: player.full_name,
          position: player.position,
          fantasy_positions: player.fantasy_positions,
          team: player.team,
          raw: player
        });
      }
    });

    // Debug log to find team defenses in Sleeper data
    console.log('Looking for team defenses in Sleeper data...');
    const allTeams = ['ARI', 'ATL', 'BAL', 'BUF', 'CAR', 'CHI', 'CIN', 'CLE', 'DAL', 'DEN', 
                      'DET', 'GB', 'HOU', 'IND', 'JAX', 'KC', 'LAC', 'LAR', 'LV', 'MIA', 
                      'MIN', 'NE', 'NO', 'NYG', 'NYJ', 'PHI', 'PIT', 'SEA', 'SF', 'TB', 
                      'TEN', 'WAS'];

    allTeams.forEach(team => {
      const teamDef = sleeperPlayers.find(p => 
        p.team === team && 
        (p.position === 'DEF' || p.fantasy_positions?.includes('DEF'))
      );
      if (teamDef) {
        console.log(`Found ${team} defense:`, {
          id: teamDef.player_id,
          name: teamDef.full_name,
          position: teamDef.position,
          fantasy_positions: teamDef.fantasy_positions,
          active: teamDef.active,
          raw: teamDef
        });
      } else {
        console.log(`No defense found for ${team}`);
      }
    });

    // Debug log for defenses from Sleeper
    const sleeperDefenses = sleeperPlayers.filter(p => 
      p.fantasy_positions?.includes('DEF') || p.position === 'DEF'
    );

    // Log different aspects of defenses
    console.log('Sleeper Defense Data:', {
      total: sleeperDefenses.length,
      active: sleeperDefenses.filter(d => d.active).length,
      details: sleeperDefenses.map(d => ({
        name: d.full_name,
        team: d.team,
        position: d.position,
        fantasy_positions: d.fantasy_positions,
        active: d.active,
        status: d.status
      }))
    });

    // Sample specific defense for structure
    const sampleDefense = sleeperPlayers.find(p => p.team === 'SF' && p.position === 'DEF');
    if (sampleDefense) {
      console.log('Sample Defense Structure:', sampleDefense);
    }

    // Before filtering players, create defense entries
    const teamDefenses = Object.keys(TEAM_DEFENSE_IDS).map(team => ({
      player_id: `${team}_DEF`,
      full_name: `${TEAM_NAMES[team]}`,
      team: team,
      position: 'DEF',
      fantasy_positions: ['DEF'],
      active: true,
      status: 'Active',
      age: 0
    } as SleeperPlayer));

    // Combine regular players with team defenses
    const allPlayers = [...sleeperPlayers, ...teamDefenses];

    // Then modify the filter
    const activeSleeperPlayers = allPlayers.filter(p => {
      if (p.position === 'DEF') {
        return true; // Include all defense entries
      }
      return p.active && p.team && p.fantasy_positions?.some(pos => VALID_POSITIONS.includes(pos));
    });

    // Debug log to verify defenses are included
    console.log('Active players by position:', {
      DEF: activeSleeperPlayers.filter(p => p.position === 'DEF').length,
      QB: activeSleeperPlayers.filter(p => p.position === 'QB').length,
      RB: activeSleeperPlayers.filter(p => p.position === 'RB').length,
      WR: activeSleeperPlayers.filter(p => p.position === 'WR').length,
      TE: activeSleeperPlayers.filter(p => p.position === 'TE').length,
      K: activeSleeperPlayers.filter(p => p.position === 'K').length,
    });

    // Fetch PFR players
    const pfrPlayers: PFRPlayer[] = [];

    // Parse offensive and defensive stats
    const $offense = cheerio.load(offenseResponse.data);
    $offense('table#fantasy tbody tr').each((i, elem) => {
      if (!$offense(elem).hasClass('thead') && !$offense(elem).hasClass('over_header') && !$offense(elem).hasClass('norank')) {
        const name = $offense(elem).find('td[data-stat="player"] a').text().trim();
        const team = $offense(elem).find('td[data-stat="team"]').text().trim();
        const position = $offense(elem).find('td[data-stat="fantasy_pos"]').text().trim();

        // Only process offensive stats for non-defensive players
        if (name && team && position && position !== 'Def' && position !== 'DEF') {
          pfrPlayers.push({
            name,
            team,
            position,
            age: $offense(elem).find('td[data-stat="age"]').text().trim(),
            games: $offense(elem).find('td[data-stat="g"]').text().trim(),
            gamesStarted: $offense(elem).find('td[data-stat="gs"]').text().trim(),
            season: season.toString(),
            // Only include offensive stats
            passingYards: parseInt($offense(elem).find('td[data-stat="pass_yds"]').text().trim() || '0'),
            passingAttempts: parseInt($offense(elem).find('td[data-stat="pass_att"]').text().trim() || '0'),
            passingTouchdowns: parseInt($offense(elem).find('td[data-stat="pass_td"]').text().trim() || '0'),
            rushingYards: parseInt($offense(elem).find('td[data-stat="rush_yds"]').text().trim() || '0'),
            rushingAttempts: parseInt($offense(elem).find('td[data-stat="rush_att"]').text().trim() || '0'),
            rushingTouchdowns: parseInt($offense(elem).find('td[data-stat="rush_td"]').text().trim() || '0'),
            receptions: parseInt($offense(elem).find('td[data-stat="rec"]').text().trim() || '0'),
            targets: parseInt($offense(elem).find('td[data-stat="targets"]').text().trim() || '0'),
            receivingYards: parseInt($offense(elem).find('td[data-stat="rec_yds"]').text().trim() || '0'),
            receivingTouchdowns: parseInt($offense(elem).find('td[data-stat="rec_td"]').text().trim() || '0')
          });
        }
        // Process defensive stats separately
        else if (name && team && (position === 'Def' || position === 'DEF')) {
          pfrPlayers.push({
            name: `${TEAM_NAMES[normalizeTeamAbbr(team)]}`,  // Use team name instead of player name
            team,
            position: 'DEF',
            age: '0',
            games: $offense(elem).find('td[data-stat="g"]').text().trim(),
            gamesStarted: $offense(elem).find('td[data-stat="gs"]').text().trim(),
            season: season.toString(),
            // ONLY include defensive stats, remove all offensive stats
            pointsAllowed: parseInt($offense(elem).find('td[data-stat="points_against"]').text().trim() || '0'),
            sacks: parseInt($offense(elem).find('td[data-stat="sacks"]').text().trim() || '0'),
            interceptions: parseInt($offense(elem).find('td[data-stat="def_int"]').text().trim() || '0'),
            forcedFumbles: parseInt($offense(elem).find('td[data-stat="fumbles_forced"]').text().trim() || '0'),
            fumbleRecoveries: parseInt($offense(elem).find('td[data-stat="fumbles_rec"]').text().trim() || '0'),
            safeties: parseInt($offense(elem).find('td[data-stat="safety"]').text().trim() || '0'),
            defensiveTouchdowns: parseInt($offense(elem).find('td[data-stat="def_td"]').text().trim() || '0'),
            specialTeamsTouchdowns: parseInt($offense(elem).find('td[data-stat="st_td"]').text().trim() || '0'),
            blockedKicks: parseInt($offense(elem).find('td[data-stat="blocked_kicks"]').text().trim() || '0')
          } as PFRPlayer);  // Cast to PFRPlayer to ensure only defensive stats are included
        }
      }
    });

    // Parse kicker stats
    const $kickers = cheerio.load(kickerResponse.data);
    $kickers('table#kicking tbody tr').each((i, elem) => {
      const name = $kickers(elem).find('td[data-stat="player"] a').text().trim();
      const team = $kickers(elem).find('td[data-stat="team"]').text().trim();
      
      if (name && team) {
        const fgm = parseInt($kickers(elem).find('td[data-stat="fgm"]').text().trim() || '0');
        const fga = parseInt($kickers(elem).find('td[data-stat="fga"]').text().trim() || '0');
        const xpm = parseInt($kickers(elem).find('td[data-stat="xpm"]').text().trim() || '0');
        const xpa = parseInt($kickers(elem).find('td[data-stat="xpa"]').text().trim() || '0');

        pfrPlayers.push({
          name,
          team,
          position: 'K',
          age: $kickers(elem).find('td[data-stat="age"]').text().trim(),
          games: $kickers(elem).find('td[data-stat="g"]').text().trim(),
          gamesStarted: $kickers(elem).find('td[data-stat="gs"]').text().trim(),
          season: season.toString(),
          fieldGoalsMade: fgm,
          fieldGoalsAttempted: fga,
          fieldGoalPercentage: fga > 0 ? Number((fgm / fga * 100).toFixed(1)) : 0,
          extraPointsMade: xpm,
          extraPointsAttempted: xpa,
          extraPointPercentage: xpa > 0 ? Number((xpm / xpa * 100).toFixed(1)) : 0,
          fieldGoalsUnder30: parseInt($kickers(elem).find('td[data-stat="fgm1"]').text().trim() || '0') + 
                            parseInt($kickers(elem).find('td[data-stat="fgm2"]').text().trim() || '0'),
          fieldGoals30to39: parseInt($kickers(elem).find('td[data-stat="fgm3"]').text().trim() || '0'),
          fieldGoals40to49: parseInt($kickers(elem).find('td[data-stat="fgm4"]').text().trim() || '0'),
          fieldGoals50Plus: parseInt($kickers(elem).find('td[data-stat="fgm5"]').text().trim() || '0')
        } as PFRPlayer);
      }
    });

    // Add debug logging
    console.log('Parsed Players:', {
      offense: pfrPlayers.filter(p => !['K', 'DEF'].includes(p.position)),
      kickers: pfrPlayers.filter(p => p.position === 'K'),
      defense: pfrPlayers.filter(p => p.position === 'DEF')
    });

    // Match players and combine data
    const combinedPlayers: CombinedPlayerData[] = activeSleeperPlayers
      .filter(sleeperPlayer => sleeperPlayer && sleeperPlayer.full_name)
      .map(sleeperPlayer => {
        let pfrPlayer;

        // Special handling for team defenses
        if (sleeperPlayer.position === 'DEF') {
          // Find matching defense stats by team
          pfrPlayer = pfrPlayers.find(p => 
            normalizeTeamAbbr(p.team) === normalizeTeamAbbr(sleeperPlayer.team) && 
            p.position === 'DEF'  // Make sure we only match defensive stats
          );
        } else {
          // Existing player matching logic for non-defense players
          const normalizedSleeperName = normalizePlayerName(sleeperPlayer.full_name);
          const normalizedSleeperTeam = normalizeTeamAbbr(sleeperPlayer.team);
          pfrPlayer = pfrPlayers.find(pfrPlayer => {
            if (!pfrPlayer?.name || !pfrPlayer?.team) return false;
            
            const normalizedPfrName = normalizePlayerName(pfrPlayer.name);
            const normalizedPfrTeam = normalizeTeamAbbr(pfrPlayer.team);
            
            // Add debug logging for matching
            if (normalizedSleeperName === normalizedPfrName) {
              console.log('Name match, checking team:', {
                player: sleeperPlayer.full_name,
                sleeper: {
                  team: sleeperPlayer.team,
                  normalizedTeam: normalizedSleeperTeam
                },
                pfr: {
                  team: pfrPlayer.team,
                  normalizedTeam: normalizedPfrTeam,
                  passingYards: pfrPlayer.passingYards
                }
              });
            }
            
            return normalizedPfrName === normalizedSleeperName && 
                   normalizedPfrTeam === normalizedSleeperTeam;
          });
        }

        // Debug log for final mapping
        if (pfrPlayer) {
          console.log('Player matched:', {
            name: sleeperPlayer.full_name,
            passingYards: pfrPlayer.passingYards
          });
        }

        // Get avatars for the player
        const playerAvatars = getPlayerAvatars(sleeperPlayer);

        return {
          sleeperId: sleeperPlayer.player_id,
          name: sleeperPlayer.full_name,
          team: sleeperPlayer.team || 'FA',
          position: sleeperPlayer.fantasy_positions?.[0] || sleeperPlayer.position || 'Unknown',
          age: pfrPlayer?.age || String(sleeperPlayer.age || ''),
          status: sleeperPlayer.status || 'Unknown',
          active: sleeperPlayer.active || false,
          espnAvatar: playerAvatars.espn,
          yahooAvatar: playerAvatars.yahoo,
          sleeperAvatar: playerAvatars.sleeper,
          imageUrl: playerAvatars.espn || playerAvatars.sleeper || playerAvatars.yahoo || '/blank-avatar.webp',
          byeWeek: NFL_BYE_WEEKS[sleeperPlayer.team] || undefined,
          games: pfrPlayer?.games,
          gamesStarted: pfrPlayer?.gamesStarted,
          season: pfrPlayer?.season,
          passingYards: pfrPlayer?.passingYards,
          passingAttempts: pfrPlayer?.passingAttempts,
          passingTouchdowns: pfrPlayer?.passingTouchdowns,
          rushingYards: pfrPlayer?.rushingYards,
          rushingAttempts: pfrPlayer?.rushingAttempts,
          rushingTouchdowns: pfrPlayer?.rushingTouchdowns,
          receptions: pfrPlayer?.receptions,
          targets: pfrPlayer?.targets,
          receivingYards: pfrPlayer?.receivingYards,
          receivingTouchdowns: pfrPlayer?.receivingTouchdowns,
          fieldGoalsMade: pfrPlayer?.fieldGoalsMade,
          fieldGoalsAttempted: pfrPlayer?.fieldGoalsAttempted,
          fieldGoalsUnder30: pfrPlayer?.fieldGoalsUnder30,
          fieldGoals30to39: pfrPlayer?.fieldGoals30to39,
          fieldGoals40to49: pfrPlayer?.fieldGoals40to49,
          fieldGoals50Plus: pfrPlayer?.fieldGoals50Plus,
          extraPointsMade: pfrPlayer?.extraPointsMade,
          extraPointsAttempted: pfrPlayer?.extraPointsAttempted,
          pointsAllowed: pfrPlayer?.pointsAllowed,
          sacks: pfrPlayer?.sacks,
          interceptions: pfrPlayer?.interceptions,
          fumbleRecoveries: pfrPlayer?.fumbleRecoveries,
          safeties: pfrPlayer?.safeties,
          defensiveTouchdowns: pfrPlayer?.defensiveTouchdowns,
          specialTeamsTouchdowns: pfrPlayer?.specialTeamsTouchdowns,
          blockedKicks: pfrPlayer?.blockedKicks,
          forcedFumbles: pfrPlayer?.forcedFumbles,
          fantasyPoints: calculateFantasyPoints({
            position: sleeperPlayer.fantasy_positions?.[0] || sleeperPlayer.position || 'Unknown',
            ...pfrPlayer
          }),
          _debug: {
            name: sleeperPlayer.full_name,
            pfrData: pfrPlayer,
            passingYards: pfrPlayer?.passingYards
          }
        };
      });

    // Before sorting, let's filter out any undefined or invalid entries
    const validPlayers = combinedPlayers.filter(player => player && player.name);

    // Add debug logging
    console.log('Players before sorting:', {
      total: combinedPlayers.length,
      valid: validPlayers.length,
      sample: validPlayers[0]
    });

    // Sort with safety checks
    const sortedPlayers = validPlayers.sort((a, b) => {
      // Add null checks
      if (!a?.name) return 1;
      if (!b?.name) return -1;
      return a.name.localeCompare(b.name);
    });

    console.log(`Successfully matched and sorted ${sortedPlayers.length} players`);
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
        const passingYards = parseInt($(elem).find('td[data-stat="pass_yds"]').text().trim() || '0');
        const passingAttempts = parseInt($(elem).find('td[data-stat="pass_att"]').text().trim() || '0');
        const passingTouchdowns = parseInt($(elem).find('td[data-stat="pass_td"]').text().trim() || '0');
        
        const rushingYards = parseInt($(elem).find('td[data-stat="rush_yds"]').text().trim() || '0');
        const rushingAttempts = parseInt($(elem).find('td[data-stat="rush_att"]').text().trim() || '0');
        const rushingTouchdowns = parseInt($(elem).find('td[data-stat="rush_td"]').text().trim() || '0');
        const receptions = parseInt($(elem).find('td[data-stat="rec"]').text().trim() || '0');
        const targets = parseInt($(elem).find('td[data-stat="targets"]').text().trim() || '0');
        const receivingYards = parseInt($(elem).find('td[data-stat="rec_yds"]').text().trim() || '0');
        const receivingTouchdowns = parseInt($(elem).find('td[data-stat="rec_td"]').text().trim() || '0');
        
        if (name && team && position) {
          pfrPlayers.push({
            name,
            team,
            position,
            age: $(elem).find('td[data-stat="age"]').text().trim(),
            games: $(elem).find('td[data-stat="g"]').text().trim(),
            gamesStarted: $(elem).find('td[data-stat="gs"]').text().trim(),
            season: season.toString(),
            passingYards,
            passingAttempts,
            passingTouchdowns,
            rushingYards,
            rushingAttempts,
            rushingTouchdowns,
            receptions,
            targets,
            receivingYards,
            receivingTouchdowns
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
        const passingYards = parseInt($(elem).find('td[data-stat="pass_yds"]').text().trim() || '0');
        
        if (name && team && position) {
          pfrPlayers.push({
            name,
            team,
            position,
            age: $(elem).find('td[data-stat="age"]').text().trim(),
            games: $(elem).find('td[data-stat="g"]').text().trim(),
            gamesStarted: $(elem).find('td[data-stat="gs"]').text().trim(),
            season: season.toString(),
            passingYards
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

// Helper function to get player avatars
const getPlayerAvatars = (player: SleeperPlayer) => {
  const avatars = {
    espn: player.espn_id ? 
      `https://a.espncdn.com/i/headshots/nfl/players/full/${player.espn_id}.png` : undefined,
    sleeper: player.player_id ? 
      `https://sleepercdn.com/content/nfl/players/${player.player_id}.jpg` : undefined,
    yahoo: player.yahoo_id ? 
      `https://s.yimg.com/iu/api/res/1.2/.../${player.yahoo_id}.png` : undefined
  };

  // Add fallback for team defense
  if (player.fantasy_positions?.includes('DEF')) {
    avatars.espn = `https://a.espncdn.com/i/teamlogos/nfl/500/${player.team?.toLowerCase()}.png`;
    avatars.sleeper = `https://sleepercdn.com/images/team_logos/nfl/${player.team?.toLowerCase()}.png`;
  }

  return avatars;
};

// Add this new endpoint to check avatars
app.get('/api/players/avatars/:playerId', async (req: Request, res: Response) => {
  try {
    const sleeperResponse = await axios.get('https://api.sleeper.app/v1/players/nfl');
    const players = Object.values(sleeperResponse.data) as SleeperPlayer[];
    const player = players.find(p => p.player_id === req.params.playerId);
    
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const avatars = getPlayerAvatars(player);
    res.json({
      player: player.full_name,
      avatars
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Define standard fantasy scoring rules
const SCORING_RULES = {
  // Passing
  passingYards: 0.04,      // 1 point per 25 yards
  passingTouchdowns: 4,     // 4 points per TD
  passingInterceptions: -2, // -2 points per INT

  // Rushing
  rushingYards: 0.1,       // 1 point per 10 yards
  rushingTouchdowns: 6,     // 6 points per TD

  // Receiving
  receptions: 1,           // 1 point per reception (PPR)
  receivingYards: 0.1,     // 1 point per 10 yards
  receivingTouchdowns: 6,   // 6 points per TD

  // Kicking
  fieldGoalsMade0to49: 3,  // 3 points for all FGs under 50 yards
  fieldGoalsMade50Plus: 5, // 5 points for 50+ yards
  extraPoints: 1,          // 1 point per PAT

  // Defense
  sacks: 1,                // 1 point per sack
  interceptions: 2,        // 2 points per INT
  fumbleRecoveries: 2,     // 2 points per FR
  safeties: 2,             // 2 points per safety
  defensiveTouchdowns: 6,  // 6 points per TD
  specialTeamsTouchdowns: 6, // 6 points per ST TD
  pointsAllowed0: 10,      // 10 points for shutout
  pointsAllowed1to6: 7,    // 7 points for 1-6 points allowed
  pointsAllowed7to13: 4,   // 4 points for 7-13 points allowed
  pointsAllowed14to20: 1,  // 1 point for 14-20 points allowed
  pointsAllowed21to27: 0,  // 0 points for 21-27 points allowed
  pointsAllowed28to34: -1, // -1 points for 28-34 points allowed
  pointsAllowed35Plus: -4  // -4 points for 35+ points allowed
};

// Function to calculate fantasy points
const calculateFantasyPoints = (player: CombinedPlayerData): number => {
  let points = 0;

  switch (player.position) {
    case 'QB':
      points += (player.passingYards || 0) * SCORING_RULES.passingYards;
      points += (player.passingTouchdowns || 0) * SCORING_RULES.passingTouchdowns;
      points += (player.rushingYards || 0) * SCORING_RULES.rushingYards;
      points += (player.rushingTouchdowns || 0) * SCORING_RULES.rushingTouchdowns;
      break;

    case 'RB':
    case 'WR':
    case 'TE':
      points += (player.receptions || 0) * SCORING_RULES.receptions;
      points += (player.receivingYards || 0) * SCORING_RULES.receivingYards;
      points += (player.receivingTouchdowns || 0) * SCORING_RULES.receivingTouchdowns;
      points += (player.rushingYards || 0) * SCORING_RULES.rushingYards;
      points += (player.rushingTouchdowns || 0) * SCORING_RULES.rushingTouchdowns;
      break;

    case 'K':
      // All field goals under 50 yards are worth 3 points
      points += ((player.fieldGoalsUnder30 || 0) * SCORING_RULES.fieldGoalsMade0to49);
      points += ((player.fieldGoals30to39 || 0) * SCORING_RULES.fieldGoalsMade0to49);
      points += ((player.fieldGoals40to49 || 0) * SCORING_RULES.fieldGoalsMade0to49);
      // 50+ yard field goals are worth 5 points
      points += ((player.fieldGoals50Plus || 0) * SCORING_RULES.fieldGoalsMade50Plus);
      // Extra points are worth 1 point
      points += ((player.extraPointsMade || 0) * SCORING_RULES.extraPoints);
      break;

    case 'DEF':
      points += (player.sacks || 0) * SCORING_RULES.sacks;
      points += (player.interceptions || 0) * SCORING_RULES.interceptions;
      points += (player.fumbleRecoveries || 0) * SCORING_RULES.fumbleRecoveries;
      points += (player.safeties || 0) * SCORING_RULES.safeties;
      points += (player.defensiveTouchdowns || 0) * SCORING_RULES.defensiveTouchdowns;
      points += (player.specialTeamsTouchdowns || 0) * SCORING_RULES.specialTeamsTouchdowns;
      
      // Calculate points allowed scoring
      const pointsAllowed = player.pointsAllowed || 0;
      if (pointsAllowed === 0) points += SCORING_RULES.pointsAllowed0;
      else if (pointsAllowed <= 6) points += SCORING_RULES.pointsAllowed1to6;
      else if (pointsAllowed <= 13) points += SCORING_RULES.pointsAllowed7to13;
      else if (pointsAllowed <= 20) points += SCORING_RULES.pointsAllowed14to20;
      else if (pointsAllowed <= 27) points += SCORING_RULES.pointsAllowed21to27;
      else if (pointsAllowed <= 34) points += SCORING_RULES.pointsAllowed28to34;
      else points += SCORING_RULES.pointsAllowed35Plus;
      break;
  }

  return Number(points.toFixed(1));
};

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