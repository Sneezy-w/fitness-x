import {
  deleteBooking,
  getBookings,
  markAttendance,
  updateBooking,
} from '@/services/service/bookings';
import { getMembers } from '@/services/service/members';
import { getSchedules } from '@/services/service/schedules';
import {
  ActionType,
  PageContainer,
  ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { Button, Modal, Space, Tag, message } from 'antd';
import { useEffect, useRef, useState } from 'react';

const BookingsPage = () => {
  const actionRef = useRef<ActionType>();
  const [schedules, setSchedules] = useState<API.Service.Schedule[]>([]);
  const [members, setMembers] = useState<API.Service.Member[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const schedulesResponse = await getSchedules();
        const membersResponse = await getMembers();
        setSchedules(schedulesResponse.data || []);
        setMembers(membersResponse.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const handleAttendance = async (id: number) => {
    try {
      await markAttendance(id);
      message.success('Attendance marked successfully');
      actionRef.current?.reload();
    } catch (error) {
      message.error('Failed to mark attendance');
      console.error('Error:', error);
    }
  };

  const handleCancel = async (id: number) => {
    try {
      await updateBooking(id, { status: 'cancelled' });
      message.success('Booking cancelled successfully');
      actionRef.current?.reload();
    } catch (error) {
      message.error('Failed to cancel booking');
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this booking?',
      content: 'This action cannot be undone.',
      okText: 'Yes, delete it',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteBooking(id);
          message.success('Booking deleted successfully');
          actionRef.current?.reload();
        } catch (error) {
          message.error('Failed to delete booking');
          console.error('Error:', error);
        }
      },
    });
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Tag color="green">Confirmed</Tag>;
      case 'cancelled':
        return <Tag color="red">Cancelled</Tag>;
      case 'attended':
        return <Tag color="blue">Attended</Tag>;
      default:
        return <Tag color="default">Unknown</Tag>;
    }
  };

  const columns: ProColumns<API.Service.Booking>[] = [
    {
      title: 'Member',
      dataIndex: 'member_id',
      key: 'member_id',
      render: (_, record) => {
        const member = members.find((m) => m.id === record.member_id);
        return member ? member.full_name : 'Unknown';
      },
    },
    {
      title: 'Class',
      dataIndex: 'schedule_id',
      key: 'schedule_id',
      render: (_, record) => {
        const schedule = schedules.find((s) => s.id === record.schedule_id);
        const className = schedule?.class?.name || 'Unknown';
        return className;
      },
    },
    {
      title: 'Date',
      dataIndex: 'schedule_id',
      key: 'date',
      render: (_, record) => {
        const schedule = schedules.find((s) => s.id === record.schedule_id);
        return schedule?.date || 'Unknown';
      },
    },
    {
      title: 'Time',
      dataIndex: 'schedule_id',
      key: 'time',
      render: (_, record) => {
        const schedule = schedules.find((s) => s.id === record.schedule_id);
        return schedule?.start_time || 'Unknown';
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      valueEnum: {
        confirmed: {
          text: 'Confirmed',
          status: 'Success',
        },
        cancelled: {
          text: 'Cancelled',
          status: 'Error',
        },
        attended: {
          text: 'Attended',
          status: 'Processing',
        },
      },
      render: (_, record) => getStatusTag(record.status),
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      valueType: 'dateTime',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.status === 'confirmed' && (
            <>
              <Button
                type="primary"
                onClick={() => handleAttendance(record.id)}
              >
                Mark Attended
              </Button>
              <Button onClick={() => handleCancel(record.id)}>Cancel</Button>
            </>
          )}
          <Button type="primary" danger onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.Service.Booking>
        columns={columns}
        actionRef={actionRef}
        request={async () => {
          const data = await getBookings();
          return {
            data: data.data || [],
            success: true,
          };
        }}
        rowKey="id"
        pagination={{
          pageSize: 10,
        }}
        search={false}
      />
    </PageContainer>
  );
};

export default BookingsPage;
