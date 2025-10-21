<template>
    <div class="department-management">
        <div class="card-header">
            <div class="header-left">
                <h3>部门管理</h3>
                <p class="sub-title">管理企业的所有部门信息</p>
            </div>
            <div class="header-right">
                <el-button type="primary" @click="showAddDepartmentForm">
                    <i class="el-icon-plus"></i>
                    新增部门
                </el-button>
            </div>
        </div>

        <div class="card-body">
            <!-- 部门列表表格 -->
            <el-table :data="paginatedDepartments" style="width: 100%" border>
                <el-table-column label="序号" width="50" type="index" :index-method="indexMethod" />
                <el-table-column prop="name" label="部门名称" width="180" />
                <el-table-column prop="description" label="部门描述" />
                <el-table-column prop="manager.name" label="部门经理" width="120">
                    <template slot-scope="scope">
                        {{ scope.row.managerName ? scope.row.managerName : '-' }}
                    </template>
                </el-table-column>
                <el-table-column prop="members" label="部门人数" width="100">
                    <template slot-scope="scope">
                        {{ scope.row.employeeCount ? scope.row.employeeCount : 0 }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180" fixed="right">
                    <template slot-scope="scope">
                        <el-button type="primary" size="small" @click="editDepartment(scope.row)">
                            编辑
                        </el-button>
                        <el-button type="danger" size="small" @click="deleteDepartment(scope.row.id)">
                            删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页组件 -->
            <div class="pagination-container">
                <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                    :current-page="currentPage" :page-sizes="[5, 10, 20, 50]" :page-size="pageSize"
                    layout="total, sizes, prev, pager, next, jumper" :total="total">
                </el-pagination>
            </div>
        </div>

        <!-- 新增/编辑部门弹窗 -->
        <el-dialog :title="editingDepartment ? '编辑部门' : '新增部门'" :visible.sync="showDepartmentForm" width="500px">
            <el-form :model="departmentForm" :rules="departmentRules" ref="departmentForm" label-width="100px">
                <el-form-item label="部门名称" prop="name">
                    <el-input v-model="departmentForm.name" placeholder="请输入部门名称" />
                </el-form-item>
                <el-form-item label="部门描述" prop="description">
                    <el-input v-model="departmentForm.description" type="textarea" placeholder="请输入部门描述" :rows="3" />
                </el-form-item>
                <el-form-item label="部门经理" prop="managerId">
                    <el-select v-model="departmentForm.managerId" placeholder="请选择部门经理">
                        <el-option v-for="user in (users || [])" :key="user.id" :label="user.name" :value="user.id" />
                    </el-select>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="cancelDepartmentForm">取消</el-button>
                <el-button type="primary" @click="submitDepartmentForm">确定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
export default {
    name: 'DepartmentManagement',
    data() {
        return {
            departments: [],
            teamMembers: [], // 确保初始化为空数组
            users: [],
            loading: false,
            showDepartmentForm: false,
            editingDepartment: null,
            // 分页相关属性
            currentPage: 1,
            pageSize: 10,
            total: 0,
            departmentForm: {
                name: '',
                description: '',
                managerId: '',
                members: []
            },
            departmentRules: {
                name: [
                    { required: true, message: '请输入部门名称', trigger: 'blur' },
                    { min: 2, max: 50, message: '部门名称长度在 2 到 50 个字符之间', trigger: 'blur' }
                ]
            }
        };
    },
    computed: {
        // 计算当前页显示的部门数据
        paginatedDepartments() {
            const start = (this.currentPage - 1) * this.pageSize;
            const end = start + this.pageSize;
            return this.departments.slice(start, end);
        }
    },
    methods: {
        indexMethod(index) {
            // 计算当前页的起始序号 = (当前页码 - 1) * 每页大小 + 当前行索引 + 1
            return (this.currentPage - 1) * this.pageSize + index + 1
        },
        // 获取部门列表
        async getDepartments() {
            this.loading = true;
            try {
                // 添加分页参数
                const params = {
                    page: this.currentPage,
                    pageSize: this.pageSize
                };
                const response = await this.$api.getDepartments(params);
                console.log('获取部门列表成功:', response);
                // 假设接口返回格式为 { departments: [...], total: ... }
                if (response.departments && response.total !== undefined) {
                    this.departments = response.departments;
                    this.total = response.total;
                } else {
                    // 如果接口不支持分页，仍使用完整数据但启用前端分页
                    this.departments = response.departments || [];
                    this.total = this.departments.length;
                }
            } catch (error) {
                console.error('获取部门列表失败:', error);
                this.departments = [];
                this.total = 0;
                this.$message.error(error.message || '获取部门列表失败');
            } finally {
                this.loading = false;
            }
        },

        // 分页大小变化处理
        handleSizeChange(size) {
            this.pageSize = size;
            this.currentPage = 1; // 重置为第一页
            this.getDepartments();
        },

        // 当前页码变化处理
        handleCurrentChange(current) {
            this.currentPage = current;
            this.getDepartments();
        },

        // 获取团队成员列表
        async getTeamMembers() {
            try {
                const data = await this.$api.getTeamMembers();
                // 确保使用 this.$set 来保证响应性
                this.$set(this, 'teamMembers', data.content || data || []);
            } catch (error) {
                console.error('获取团队成员失败:', error);
                this.$set(this, 'teamMembers', []); // 出错时设置为空数组
                this.$message.error(error.message || '获取团队成员失败');
            }
        },

        // 显示添加部门表单
        showAddDepartmentForm() {
            this.editingDepartment = null;
            this.resetDepartmentForm();
            this.showDepartmentForm = true;
        },

        // 编辑部门
        editDepartment(department) {
            this.editingDepartment = { ...department };
            this.departmentForm = {
                name: department.name,
                description: department.description || '',
                managerId: department.managerId || '',
                members: (department.members || []).map(member => member.id || member) // 添加空值检查
            };
            this.showDepartmentForm = true;
        },

        // 重置部门表单
        resetDepartmentForm() {
            this.departmentForm = {
                name: '',
                description: '',
                managerId: '',
                members: []
            };
            this.$refs.departmentForm && this.$refs.departmentForm.resetFields();
        },

        // 取消部门表单
        cancelDepartmentForm() {
            this.showDepartmentForm = false;
            this.resetDepartmentForm();
        },

        // 提交部门表单
        async submitDepartmentForm() {
            this.$refs.departmentForm.validate(async (valid) => {
                if (valid) {
                    try {
                        if (this.editingDepartment) {
                            // 编辑部门
                            await this.$api.updateDepartment(this.editingDepartment.id, this.departmentForm);
                            this.$message.success('部门更新成功');
                        } else {
                            // 添加部门
                            await this.$api.createDepartment(this.departmentForm);
                            this.$message.success('部门添加成功');
                        }

                        // 关闭表单并刷新当前页部门列表
                        this.showDepartmentForm = false;
                        this.resetDepartmentForm();
                        await this.getDepartments(); // 只刷新当前页
                    } catch (error) {
                        console.error('提交部门表单失败:', error);
                        this.$message.error(error.message || '操作失败，请重试');
                    }
                }
            });
        },

        // 删除部门
        deleteDepartment(id) {
            this.$confirm('确定要删除这个部门吗？', '删除部门', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                try {
                    await this.$api.deleteDepartment(id);
                    this.$message.success('部门删除成功');

                    // 如果当前页没有数据了且不是第一页，则返回上一页
                    if (this.paginatedDepartments.length === 1 && this.currentPage > 1) {
                        this.currentPage--;
                    }
                    await this.getDepartments(); // 只刷新当前页
                } catch (error) {
                    console.error('删除部门失败:', error);
                    this.$message.error(error.message || '删除失败，请重试');
                }
            }).catch(() => {
                // 用户取消删除
            });
        },

        // 获取完整用户列表
        async getUsers() {
            try {
                const response = await this.$api.getUsers();
                this.users = response.data || []; // 兼容不同的返回格式，确保始终是数组
            } catch (error) {
                console.error('获取用户列表失败:', error);
                this.users = []; // 出错时设置为空数组
                this.$message.error(error.message || '获取用户列表失败');
            }
        },

        // 刷新数据
        async refresh() {
            this.currentPage = 1; // 刷新时重置为第一页
            await Promise.all([
                this.getDepartments(),
                this.getTeamMembers(),
                this.getUsers()
            ]);
        }
    },

    // 添加 beforeCreate 钩子以确保属性在渲染前可用
    beforeCreate() {
        this.teamMembers = [];
        this.users = [];
    },

    // 组件挂载时获取数据
    async mounted() {
        await this.refresh();
    }
};
</script>

<style scoped lang="scss">
.department-management {
    margin-bottom: 24px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 20px;
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

.dialog-footer {
    text-align: right;
}

.pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}
</style>