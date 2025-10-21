<template>
  <div class="project-trends">
    <el-card shadow="hover">
      <div class="card-header">
        <div class="header-left">
          <h3>项目进度趋势</h3>
          <p class="sub-title">显示项目完成情况的趋势变化</p>
        </div>
        <div class="header-right">
          <el-radio-group v-model="chartType" @change="handleChartTypeChange">
            <el-radio-button label="week">本周</el-radio-button>
            <el-radio-button label="month">本月</el-radio-button>
            <el-radio-button label="year">全年</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <div class="card-body">
        <div class="chart-container" v-loading="chartLoading">
          <!-- 使用原生 div 渲染折线图 -->
          <div ref="chart" style="width: 100%; height: 100%;"></div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'ProjectTrends',
  data() {
    return {
      chartType: 'week',
      chartLoading: false,
      chartInstance: null,
      currentPeriodLabel: '本周完成',
      previousPeriodLabel: '上周完成'
    }
  },
  methods: {
    handleChartTypeChange() {
      this.updateChartData()
    },

    updateChartData() {
      let chartData
      switch (this.chartType) {
        case 'week':
          this.currentPeriodLabel = '本周完成'
          this.previousPeriodLabel = '上周完成'
          chartData = {
            labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
            currentData: [12, 19, 8, 15, 22, 18, 25],
            previousData: [10, 15, 12, 8, 18, 20, 22]
          }
          break
        case 'month':
          this.currentPeriodLabel = '本月完成'
          this.previousPeriodLabel = '上月完成'
          chartData = {
            labels: ['第1周', '第2周', '第3周', '第4周'],
            currentData: [45, 52, 38, 60],
            previousData: [40, 48, 35, 55]
          }
          break
        case 'year':
          this.currentPeriodLabel = '今年完成'
          this.previousPeriodLabel = '去年完成'
          chartData = {
            labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
            currentData: [120, 135, 110, 145, 160, 155, 180, 170, 165, 190, 185, 200],
            previousData: [110, 125, 105, 135, 150, 145, 170, 160, 155, 180, 175, 190]
          }
          break
      }
      this.renderChart(chartData)
    },

    renderChart(chartData) {
      if (!this.chartInstance) {
        this.initChart()
      }

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line',
            lineStyle: {
              color: 'rgba(0,0,0,0.2)',
              width: 1,
              type: 'solid'
            }
          },
          formatter: function (params) {
            let result = `${params[0].axisValue}<br/>`
            params.forEach(param => {
              result += `${param.seriesName}: ${param.value} 个项目<br/>`
            })
            return result
          }
        },
        legend: {
          data: [this.currentPeriodLabel, this.previousPeriodLabel],
          top: 10,
          textStyle: {
            fontSize: 12
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '60px',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: chartData.labels,
          axisLine: {
            lineStyle: {
              color: '#E4E7ED'
            }
          },
          axisTick: {
            alignWithLabel: true
          },
          axisLabel: {
            color: '#606266'
          }
        },
        yAxis: {
          type: 'value',
          name: '项目数量',
          axisLine: {
            lineStyle: {
              color: '#E4E7ED'
            }
          },
          axisLabel: {
            color: '#606266'
          },
          splitLine: {
            lineStyle: {
              color: '#F0F0F0',
              type: 'dashed'
            }
          }
        },
        series: [
          {
            name: this.previousPeriodLabel,
            type: 'line',
            data: chartData.previousData,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: {
              color: '#94A3B8',
              width: 2
            },
            itemStyle: {
              color: '#94A3B8',
              borderWidth: 1,
              borderColor: '#fff'
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{
                  offset: 0,
                  color: 'rgba(148, 163, 184, 0.3)'
                }, {
                  offset: 1,
                  color: 'rgba(148, 163, 184, 0.1)'
                }]
              }
            },
            smooth: true
          },
          {
            name: this.currentPeriodLabel,
            type: 'line',
            data: chartData.currentData,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: {
              color: '#3B82F6',
              width: 3
            },
            itemStyle: {
              color: '#3B82F6',
              borderWidth: 1,
              borderColor: '#fff'
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{
                  offset: 0,
                  color: 'rgba(59, 130, 246, 0.3)'
                }, {
                  offset: 1,
                  color: 'rgba(59, 130, 246, 0.1)'
                }]
              }
            },
            smooth: true
          }
        ]
      }

      this.chartInstance.setOption(option)
    },

    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.chart)

      // 窗口大小变化时重置图表大小
      const resizeHandler = () => {
        if (this.chartInstance) {
          this.chartInstance.resize()
        }
      }
      window.addEventListener('resize', resizeHandler)

      // 在组件销毁时移除监听器
      this.$once('hook:beforeDestroy', () => {
        window.removeEventListener('resize', resizeHandler)
        if (this.chartInstance) {
          this.chartInstance.dispose()
        }
      })
    },

    async loadChartData() {
      this.chartLoading = true
      try {
        // 模拟 API 调用
        await new Promise(resolve => setTimeout(resolve, 1000))
        this.updateChartData()
      } catch (error) {
        console.error('加载图表数据失败:', error)
        this.$message.error('加载图表数据失败')
      } finally {
        this.chartLoading = false
      }
    },
    refresh() {
      this.loadChartData()
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart()
      this.updateChartData()
    })
  },

  beforeDestroy() {
    if (this.chartInstance) {
      this.chartInstance.dispose()
    }
  }
}
</script>

<style scoped>
.project-trends {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.header-left h3 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
}

.sub-title {
  font-size: 12px;
  color: #999;
  margin: 0;
}

.card-body {
  padding: 20px;
}

.chart-container {
  height: 400px;
  position: relative;
}
</style>