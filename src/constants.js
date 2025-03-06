// src/constants.js
// Field is 20m x 10m
// Field is 20m x 10m with coordinates centered at (0,0)
export const FIELD_WIDTH = 1000; // 20m, scaled to 1000px
export const FIELD_HEIGHT = 500; // 10m, scaled to 500px
// Field center coordinates (in pixels)
export const FIELD_CENTER_X = FIELD_WIDTH / 2;
export const FIELD_CENTER_Y = FIELD_HEIGHT / 2;
// Drone size: 0.4m diameter
export const PLAYER_SIZE = 15; // 0.4m diameter, scaled to 20px
export const BALL_SIZE = 15; // 0.4m diameter, scaled to 20px
export const PLAYER_SPEED = 8;
export const GAME_DURATION = 180; // 3 minutes in seconds
export const GOAL_DISTANCE = 100; // 2m from boundary, scaled to 100px
export const GOAL_WIDTH = 10;
export const GOAL_HEIGHT = 50;
export const GOAL_POST_DIAMETER = 10; // 0.2m diameter for goal posts, scaled to 10px
export const TOUCH_BUTTON_SIZE = 64; // Size for touch control buttons

// Physics constants
export const COLLISION_ELASTICITY = 0.8; // Bounce factor for collisions
export const FRICTION = 0.98; // Friction factor to slow down movement
export const RESTITUTION = 0.9; // Coefficient of restitution for collisions