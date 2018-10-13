import Game from './game';

import LEVEL from './level';

// Game.setup(LEVEL);
Game.setup(Game.generateLevel(100, 100));
Game.start();
