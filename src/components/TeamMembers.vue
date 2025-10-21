<template>
  <div class="team-members">
    <el-card shadow="hover">
      <div class="card-header">
        <div class="header-left">
          <h3>团队成员</h3>
          <p class="sub-title">查看和管理团队成员信息</p>
        </div>
      </div>

      <div class="card-body">
        <!-- 搜索 -->
        <div class="search-box">
          <el-input v-model="searchKeyword" placeholder="搜索成员姓名" clearable class="search-input">
            <!-- <i slot="prefix" class="el-icon-search" style="margin-top: 12px;"></i> -->
            <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
          </el-input>
        </div>

        <!-- 团队成员列表 -->
        <div class="members-grid">
          <div v-for="member in filteredMembers" :key="member.id" class="member-card">
            <div class="member-avatar">
              <img
                :src="member.avatar || 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fci.xiaohongshu.com%2Fc34b7b74-ba38-0456-982a-43c0f97522fe%3FimageView2%2F2%2Fw%2F1080%2Fformat%2Fjpg&refer=http%3A%2F%2Fci.xiaohongshu.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1763168553&t=eddfc58c26901fd446b900d0d234ac3d'"
                :alt="member.name">
            </div>
            <div class="member-info">
              <h4>{{ member.name }}</h4>
              <p class="member-position">{{ member.position }}</p>
              <p class="member-email">{{ member.email }}</p>
              <div class="member-projects">
                <span class="project-count">
                  {{ member.projectCount }} 个项目
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination">
          <el-pagination layout="total, sizes, prev, pager, next, jumper" :total="filteredMembers.length"
            :page-size="pageSize" :page-sizes="[10, 20, 30]" v-model="currentPage" @size-change="handleSizeChange"
            @current-change="handleCurrentChange" />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'TeamMembers',
  // 在data()中添加departments数组和selectedDepartment变量
  data() {
    return {
      members: [],
      filteredMembers: [],
      loading: false,
      searchKeyword: '',
      pageSize: 10,
      currentPage: 1,
      totalItems: 0,  // 添加总条数
      totalPages: 0,  // 添加总页数
      departments: [], // 部门列表
      selectedDepartment: '', // 选中的部门ID，空字符串表示全部
      groupedMembers: {} // 按部门分组的成员数据
    }
  },
  methods: {
    // 获取团队成员
    async getTeamMembers() {
      this.loading = true
      try {
        // 注意：后端的page从0开始，前端的currentPage从1开始
        const response = await this.$api.getTeamMembers(this.currentPage - 1, this.pageSize)

        this.members = response.data.content
        this.totalItems = response.totalElements
        this.totalPages = response.totalPages
        this.filterMembers()
      } catch (error) {
        console.error('获取团队成员失败:', error)
        this.$message.error(error.message || '获取团队成员失败')
      } finally {
        this.loading = false
      }
    },
    handleSearch() {
      this.filterMembers();
    },
    // 处理分页大小变化
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
      this.getTeamMembers()
    },

    // 处理当前页变化
    handleCurrentChange(current) {
      this.currentPage = current
      this.getTeamMembers()
    },

    // 添加获取部门列表的方法
    async getDepartments() {
      try {
        const response = await this.$api.getDepartments();
        this.departments = Array.isArray(response) ? response : (response.departments || (response.data || []));
      } catch (error) {
        console.error('获取部门列表失败:', error);
        this.departments = [];
      }
    },

    // 修改filterMembers方法，支持按部门筛选并分组
    filterMembers() {
      let filtered = [...this.members]

      // 搜索筛选
      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase()
        filtered = filtered.filter(member =>
          member.name.toLowerCase().includes(keyword)
        )
      }

      // 部门筛选
      if (this.selectedDepartment) {
        filtered = filtered.filter(member =>
          member.department && member.department.id === this.selectedDepartment
        )
      }

      // 按部门分组
      this.groupedMembers = {};
      filtered.forEach(member => {
        const departmentName = member.department && member.department.name ?
          member.department.name : '无部门';

        if (!this.groupedMembers[departmentName]) {
          this.groupedMembers[departmentName] = [];
        }
        this.groupedMembers[departmentName].push(member);
      });

      this.filteredMembers = filtered
    },

    // 修改refresh方法，同时获取部门数据
    async refresh() {
      await Promise.all([
        this.getTeamMembers(),
        this.getDepartments()
      ]);
    },

    // 修改mounted钩子，同时获取部门数据
    mounted() {
      this.refresh();
    },

    // 刷新数据
    async refresh() {
      await this.getTeamMembers()
    }
  },
  mounted() {
    // console.log('组件挂载时获取团队成员', localStorage.getItem('authToken'))
    // 组件挂载时获取团队成员
    this.getTeamMembers()
  }
}
</script>

<style scoped>
.team-members {
  margin-bottom: 24px;
}

.card-header {
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

.search-box {
  margin-bottom: 24px;
}

.search-input {
  width: 300px;
}

.members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.member-card {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  transition: all 0.3s;
}

.member-card:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.member-avatar {
  margin-right: 16px;
}

.member-avatar img {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
}

.member-info {
  flex: 1;
}

.member-info h4 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
}

.member-position {
  font-size: 14px;
  color: #666;
  margin: 0 0 8px 0;
}

.member-email {
  font-size: 12px;
  color: #999;
  margin: 0 0 8px 0;
}

.member-projects {
  display: flex;
  align-items: center;
}

.project-count {
  font-size: 12px;
  color: #409eff;
  padding: 2px 8px;
  background-color: #ecf5ff;
  border-radius: 4px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>

// 修改模板，添加部门筛选下拉框并按部门分组展示
<template>
  <div class="team-members">
    <el-card shadow="hover">
      <div class="card-header">
        <div class="header-left">
          <h3>团队成员</h3>
          <p class="sub-title">查看和管理团队成员信息</p>
        </div>
      </div>

      <div class="card-body">
        <!-- 搜索和筛选 -->
        <div class="search-box">
          <el-input v-model="searchKeyword" placeholder="搜索成员姓名" clearable class="search-input">
            <el-select v-model="selectedDepartment" slot="prepend" placeholder="筛选部门" clearable
              class="department-select" @change="handleSearch">
              <el-option label="全部部门" value="" />
              <el-option v-for="dept in departments" :key="dept.id" :label="dept.name" :value="dept.id" />
            </el-select>
            <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
          </el-input>
        </div>

        <!-- 按部门分组展示团队成员 -->
        <div class="departments-container">
          <div v-for="(members, deptName) in groupedMembers" :key="deptName" class="department-group">
            <div class="department-header">
              <h4>{{ deptName }} ({{ members.length }}人)</h4>
            </div>
            <div class="members-grid">
              <div v-for="member in members" :key="member.id" class="member-card">
                <div class="member-avatar">
                  <img
                    :src="member.avatar || 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fci.xiaohongshu.com%2Fc34b7b74-ba38-0456-982a-43c0f97522fe%3FimageView2%2F2%2Fw%2F1080%2Fformat%2Fjpg&refer=http%3A%2F%2Fci.xiaohongshu.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1763168553&t=eddfc58c26901fd446b900d0d234ac3d'"
                    :alt="member.name">
                </div>
                <div class="member-info">
                  <h4>{{ member.name }}</h4>
                  <p class="member-position">{{ member.position }}</p>
                  <p class="member-email">{{ member.email }}</p>
                  <div class="member-projects">
                    <span class="project-count">
                      {{ member.projectCount }} 个项目
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination">
          <el-pagination layout="total, sizes, prev, pager, next, jumper" :total="filteredMembers.length"
            :page-size="pageSize" :page-sizes="[10, 20, 30]" v-model="currentPage" @size-change="handleSizeChange"
            @current-change="handleCurrentChange" />
        </div>
      </div>
    </el-card>
  </div>
</template>

// 添加部门分组相关的样式
.departments-container {
margin-bottom: 20px;
}

.department-group {
margin-bottom: 24px;
}

.department-header {
padding: 12px 0;
border-bottom: 2px solid #409eff;
margin-bottom: 16px;
}

.department-header h4 {
font-size: 18px;
font-weight: 600;
color: #333;
margin: 0;
}

.department-select {
width: 150px;
}