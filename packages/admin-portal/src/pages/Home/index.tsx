import {
  BarChartOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  LineChartOutlined,
  ScheduleOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
import {
  Alert,
  Card,
  Col,
  Divider,
  Progress,
  Row,
  Spin,
  Statistic,
  Typography,
} from 'antd';
import React from 'react';

const { Title, Text } = Typography;

const DashboardPage: React.FC = () => {
  const { data, error, loading } = useRequest('/api/statistics/dashboard');

  if (loading) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '20px' }}>
            Loading dashboard statistics...
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Alert
          message="Error Loading Dashboard"
          description="There was a problem loading the dashboard statistics. Please try again later."
          type="error"
          showIcon
        />
      </PageContainer>
    );
  }

  const { memberStats, attendanceStats, bookingStats, trainerStats } = data || {
    memberStats: {},
    attendanceStats: {},
    bookingStats: {},
    trainerStats: {},
  };

  return (
    <PageContainer title="Dashboard">
      <div className="dashboard-container">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={12} lg={6}>
            <Card bordered={false}>
              <Statistic
                title="Total Members"
                value={memberStats.totalMembers || 0}
                prefix={<TeamOutlined />}
              />
              <div style={{ marginTop: 10 }}>
                <Text type="secondary">
                  Active Members: {memberStats.activeMembers || 0}
                </Text>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={12} lg={6}>
            <Card bordered={false}>
              <Statistic
                title="New Members (30 days)"
                value={memberStats.newMembersLast30Days || 0}
                prefix={<UserOutlined />}
              />
              <div style={{ marginTop: 10 }}>
                <Text type="secondary">
                  90 days: {memberStats.newMembersLast90Days || 0}
                </Text>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={12} lg={6}>
            <Card bordered={false}>
              <Statistic
                title="Bookings (Last 7 days)"
                value={bookingStats.last7DaysBookings || 0}
                prefix={<ScheduleOutlined />}
              />
              <div style={{ marginTop: 10 }}>
                <Text type="secondary">
                  Today: {bookingStats.todayBookings || 0}
                </Text>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={12} lg={6}>
            <Card bordered={false}>
              <Statistic
                title="Total Trainers"
                value={trainerStats.totalTrainers || 0}
                prefix={<UserOutlined />}
              />
              <div style={{ marginTop: 10 }}>
                <Text type="secondary">
                  Approved: {trainerStats.approvedTrainers || 0}
                </Text>
              </div>
            </Card>
          </Col>
        </Row>

        <Divider orientation="left">Attendance Analysis</Divider>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Attendance Statistics" bordered={false}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic
                    title="Classes Held (30 days)"
                    value={attendanceStats.totalClasses || 0}
                    prefix={<CalendarOutlined />}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Total Bookings"
                    value={attendanceStats.totalBookings || 0}
                    prefix={<BarChartOutlined />}
                  />
                </Col>
              </Row>

              <Divider />

              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic
                    title="Attended"
                    value={attendanceStats.totalAttendance || 0}
                    prefix={
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    }
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Missed"
                    value={attendanceStats.missedClasses || 0}
                    prefix={
                      <ClockCircleOutlined style={{ color: '#ff4d4f' }} />
                    }
                  />
                </Col>
              </Row>

              <div style={{ marginTop: 24 }}>
                <Title level={5}>Attendance Rate</Title>
                <Progress
                  percent={Math.round(attendanceStats.attendanceRate || 0)}
                  status="active"
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                />
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Member Activity" bordered={false}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic
                    title="Active Rate"
                    value={Math.round(memberStats.activeRate || 0)}
                    suffix="%"
                    prefix={<LineChartOutlined />}
                  />
                  <Progress
                    percent={Math.round(memberStats.activeRate || 0)}
                    showInfo={false}
                    status="active"
                    strokeColor={{
                      '0%': '#faad14',
                      '100%': '#52c41a',
                    }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Avg. Bookings per Day"
                    value={
                      bookingStats.avgBookingsPerDay
                        ? Math.round(bookingStats.avgBookingsPerDay * 10) / 10
                        : 0
                    }
                    prefix={<BarChartOutlined />}
                  />
                </Col>
              </Row>

              <Divider />

              <div style={{ marginTop: 24 }}>
                <Title level={5}>Member Status</Title>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Card
                      size="small"
                      bordered={false}
                      style={{ background: '#f6ffed', padding: '10px' }}
                    >
                      <Statistic
                        title="Active Members"
                        value={memberStats.activeMembers || 0}
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card
                      size="small"
                      bordered={false}
                      style={{ background: '#fff2e8', padding: '10px' }}
                    >
                      <Statistic
                        title="Inactive Members"
                        value={memberStats.inactiveMembers || 0}
                        valueStyle={{ color: '#fa8c16' }}
                      />
                    </Card>
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </PageContainer>
  );
};

export default DashboardPage;
