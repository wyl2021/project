<template>
  <div class="dashboard-overview">
    <div class="overview-cards">
      <el-card class="card total-projects" shadow="hover">
        <div class="card-content">
          <div class="card-icon">
            <CustomIcon name="total" size="64" />
            <!-- <i class="el-icon-project"></i> -->
          </div>
          <div class="card-info">
            <div class="card-value">{{ statistics.totalProjects }}</div>
            <div class="card-label">总项目数</div>
          </div>
        </div>
      </el-card>

      <el-card class="card active-projects" shadow="hover">
        <div class="card-content">
          <div class="card-icon">
            <!-- <CustomIcon name="loading" size="64" /> -->
            <i class="el-icon-loading"></i>
          </div>
          <div class="card-info">
            <div class="card-value">{{ statistics.inProgressProjects }}</div>
            <div class="card-label">进行中项目</div>
          </div>
        </div>
      </el-card>

      <el-card class="card completed-projects" shadow="hover">
        <div class="card-content">
          <div class="card-icon">
            <!-- <CustomIcon name="check" size="32" /> -->
            <i class="el-icon-check"></i>
          </div>
          <div class="card-info">
            <div class="card-value">{{ statistics.completedProjects }}</div>
            <div class="card-label">已完成项目</div>
          </div>
        </div>
      </el-card>

      <el-card class="card delayed-projects" shadow="hover">
        <div class="card-content">
          <div class="card-icon">
            <!-- <CustomIcon name="clock" size="64" /> -->
            <i class="el-icon-alarm-clock"></i>
          </div>
          <div class="card-info">
            <div class="card-value">{{ statistics.delayedProjects }}</div>
            <div class="card-label">延期项目</div>
          </div>
        </div>
      </el-card>
    </div>

    <div class="overview-details">
      <el-card shadow="hover">
        <div class="card-header">
          <h3>项目完成情况</h3>
        </div>
        <div class="card-body">
          <div class="stats-row">
            <div class="stat-item">
              <div class="stat-label">按时完成率</div>
              <div class="stat-value">{{ statistics.averageProgress }}%</div>
              <div class="stat-bar">
                <div class="stat-progress" :style="{ width: statistics.averageProgress + '%' }"></div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-label">平均完成率</div>
              <div class="stat-value">{{ statistics.averageCompletionRate }}%</div>
              <div class="stat-bar">
                <div class="stat-progress" :style="{ width: statistics.averageCompletionRate + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DashboardOverview',
  data() {
    return {
      statistics: {
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        delayedProjects: 0,
        onTimeRate: 0,
        avgCompletionRate: 0
      },
      loading: false
    }
  },
  methods: {
    // 获取项目统计数据
    async getStatistics() {
      try {
        const data = await this.$api.getProjectStatistics()
        this.statistics = data

        // 为数据添加动画效果
        this.$nextTick(() => {
          this.animateStats()
        })
      } catch (error) {
        console.error('获取项目统计数据失败:', error)
        this.$message.error(error.message || '获取项目统计数据失败')
      }
    },

    // 为统计数据添加动画效果
    animateStats() {
      const statElements = document.querySelectorAll('.card-value, .stat-value')
      statElements.forEach(el => {
        const targetValue = el.textContent
        if (!isNaN(targetValue) && targetValue !== '') {
          let currentValue = 0
          const duration = 1000 // 动画持续时间（毫秒）
          const steps = 60 // 动画步数
          const increment = parseFloat(targetValue) / steps
          const interval = duration / steps

          const timer = setInterval(() => {
            currentValue += increment
            if (currentValue >= parseFloat(targetValue)) {
              currentValue = parseFloat(targetValue)
              clearInterval(timer)
            }
            el.textContent = targetValue.includes('%')
              ? currentValue.toFixed(1) + '%'
              : Math.round(currentValue)
          }, interval)
        }
      })
    },

    // 刷新数据
    async refresh() {
      await this.getStatistics()
    }
  },
  mounted() {
    // 组件挂载时获取数据
    this.getStatistics()
  }
}
</script>

<style scoped>
.dashboard-overview {
  margin-bottom: 24px;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.card {
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-content {
  display: flex;
  align-items: center;
  padding: 20px;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 16px;
}

.card-info {
  flex: 1;
}

.card-value {
  font-size: 32px;
  font-weight: 600;
  line-height: 1;
  margin-bottom: 4px;
}

.card-label {
  font-size: 14px;
  color: #666;
}

/* 不同卡片的颜色主题 */
.total-projects .card-icon {
  background-color: #e6f7ff;
  color: #1890ff;
}

.active-projects .card-icon {
  background-color: #fff2e8;
  color: #fa8c16;
}

.completed-projects .card-icon {
  background-color: #f6ffed;
  color: #52c41a;
}

.delayed-projects .card-icon {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.overview-details {
  margin-top: 20px;
}

.card-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.card-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.card-body {
  padding: 20px;
}

.stats-row {
  display: flex;
  gap: 40px;
}

.stat-item {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 12px;
}

.stat-bar {
  width: 100%;
  height: 6px;
  background-color: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
}

.stat-progress {
  height: 100%;
  background-color: #1890ff;
  border-radius: 3px;
  transition: width 1s ease-out;
}
</style>