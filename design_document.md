# 2D无人机足球游戏设计文档

## 1. 概述
本文档详细描述2D无人机足球游戏的设计，包括参数设置、关键代码逻辑等。

## 2. 参数设置

### 2.1 游戏常量
- `GAME_DURATION`: 游戏时长（秒）
- `FIELD_WIDTH`: 球场宽度（像素）
- `FIELD_HEIGHT`: 球场高度（像素）
- `GOAL_WIDTH`: 球门宽度（像素）
- `GOAL_HEIGHT`: 球门高度（像素）
- `PLAYER_SIZE`: 无人机直径（像素）
- `RESTITUTION`: 碰撞恢复系数
- `GOAL_DISTANCE`: 球门距离边界距离（像素）
- `GOAL_POST_DIAMETER`: 球门柱直径（像素）
- `FIELD_CENTER_X`: 球场中心X坐标（像素）
- `FIELD_CENTER_Y`: 球场中心Y坐标（像素）

### 2.2 初始位置
- 蓝球初始位置: `(FIELD_CENTER_X - 250, FIELD_CENTER_Y)`
- 红球初始位置: `(FIELD_CENTER_X + 250, FIELD_CENTER_Y)`

## 3. 关键代码逻辑

### 3.1 碰撞检测
- `checkCollision(pos1, pos2, radius)`: 检测两个对象是否碰撞
- `calculateCollisionResponse(pos1, vel1, pos2, vel2)`: 计算碰撞后的速度

### 3.2 球门柱碰撞检测
- `checkGoalPostCollision(playerPos, playerVel, postPos)`: 检测无人机与球门柱的碰撞，并计算反弹后的速度和位置

### 3.3 进球检测
- `checkGoal(pos, isPlayer1, lastXPos)`: 检测无人机是否进入球门，并判断进球是否有效

### 3.4 游戏循环
- `gameLoop()`: 游戏主循环，处理碰撞检测、进球检测、速度更新等逻辑

## 4. 其他
- 游戏结束后，点击重置按钮可重新开始游戏。
