import { getClasses } from '@/services/service/classes';
import {
  cancelSchedule,
  createSchedule,
  deleteSchedule,
  getSchedules,
  updateSchedule,
} from '@/services/service/schedules';
import { getTrainers } from '@/services/service/trainers';
import {
  ActionType,
  PageContainer,
  ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import {
  Button,
  DatePicker,
  Form,
  InputNumber,
  message,
  Modal,
  Select,
  Space,
  TimePicker,
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';

const SchedulesPage = () => {
  const actionRef = useRef<ActionType>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit'>('create');
  const [currentRecord, setCurrentRecord] =
    useState<API.Service.Schedule | null>(null);
  const [classes, setClasses] = useState<API.Service.Class[]>([]);
  const [trainers, setTrainers] = useState<API.Service.Trainer[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const classesResponse = await getClasses();
        const trainersResponse = await getTrainers();
        setClasses(classesResponse.data || []);
        setTrainers(trainersResponse.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const showCreateModal = () => {
    setModalType('create');
    setCurrentRecord(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = (record: API.Service.Schedule) => {
    setModalType('edit');
    setCurrentRecord(record);
    form.setFieldsValue({
      class_id: record.class_id,
      trainer_id: record.trainer_id,
      date: dayjs(record.date),
      start_time: dayjs(record.start_time, 'HH:mm'),
      end_time: dayjs(record.end_time, 'HH:mm'),
      capacity: record.capacity,
      is_cancelled: record.is_cancelled,
    });
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      // Validate that end time is after start time
      const startTime = values.start_time;
      const endTime = values.end_time;
      if (endTime.isBefore(startTime)) {
        message.error('End time must be after start time');
        return;
      }

      const formattedValues = {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
        start_time: values.start_time.format('HH:mm'),
        end_time: values.end_time.format('HH:mm'),
      };

      if (modalType === 'create') {
        await createSchedule(formattedValues);
        message.success('Schedule created successfully');
      } else {
        await updateSchedule(currentRecord!.id, formattedValues);
        message.success('Schedule updated successfully');
      }

      setIsModalVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      console.error('Error:', error);
      message.error('Failed to save schedule');
    }
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this schedule?',
      content: 'This action cannot be undone.',
      okText: 'Yes, delete it',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteSchedule(id);
          message.success('Schedule deleted successfully');
          actionRef.current?.reload();
        } catch (error) {
          message.error('Failed to delete schedule');
          console.error('Error:', error);
        }
      },
    });
  };

  const handleCancel = async (id: number) => {
    Modal.confirm({
      title: 'Are you sure you want to cancel this schedule?',
      content: 'This action cannot be undone.',
      onOk: async () => {
        try {
          await cancelSchedule(id);
          message.success('Schedule cancelled successfully');
          actionRef.current?.reload();
        } catch (error) {
          message.error('Failed to cancel schedule');
          console.error('Error:', error);
        }
      },
    });
  };

  const columns: ProColumns<API.Service.Schedule>[] = [
    {
      title: 'Class',
      dataIndex: 'class_id',
      key: 'class_id',
      render: (_, record) => {
        const classItem = classes.find((c) => c.id === record.class_id);
        return classItem ? classItem.name : 'Unknown';
      },
    },
    {
      title: 'Trainer',
      dataIndex: 'trainer_id',
      key: 'trainer_id',
      render: (_, record) => {
        const trainer = trainers.find((t) => t.id === record.trainer_id);
        return trainer ? trainer.full_name : 'Unknown';
      },
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      valueType: 'date',
    },
    {
      title: 'Start Time',
      dataIndex: 'start_time',
      key: 'start_time',
    },
    {
      title: 'End Time',
      dataIndex: 'end_time',
      key: 'end_time',
    },
    {
      title: 'Capacity',
      dataIndex: 'capacity',
      key: 'capacity',
    },
    {
      title: 'Status',
      dataIndex: 'is_cancelled',
      key: 'is_cancelled',
      valueEnum: {
        false: {
          text: 'Active',
          status: 'Success',
        },
        true: {
          text: 'Cancelled',
          status: 'Error',
        },
      },
      render: (_, record) => (
        <span style={{ color: record.is_cancelled ? 'red' : 'green' }}>
          {record.is_cancelled ? 'Cancelled' : 'Active'}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => showEditModal(record)}>
            Edit
          </Button>
          <Button type="primary" danger onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
          {/* {!record.is_cancelled && (
            <Button
              type="primary"
              danger
              onClick={() => handleCancel(record.id)}
            >
              Cancel
            </Button>
          )} */}
        </Space>
      ),
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.Service.Schedule>
        columns={columns}
        actionRef={actionRef}
        request={async () => {
          const data = await getSchedules();
          return {
            data: data.data || [],
            success: true,
          };
        }}
        rowKey="id"
        pagination={{
          pageSize: 10,
        }}
        toolBarRender={() => [
          <Button key="add" type="primary" onClick={showCreateModal}>
            Create New Schedule
          </Button>,
        ]}
        search={false}
      />

      <Modal
        title={modalType === 'create' ? 'Create Schedule' : 'Edit Schedule'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="class_id"
            label="Class"
            rules={[{ required: true, message: 'Please select a class' }]}
          >
            <Select placeholder="Select a class">
              {classes.map((cls) => (
                <Select.Option key={cls.id} value={cls.id}>
                  {cls.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="trainer_id"
            label="Trainer"
            rules={[{ required: true, message: 'Please select a trainer' }]}
          >
            <Select placeholder="Select a trainer">
              {trainers
                .filter((trainer) => trainer.is_approved)
                .map((trainer) => (
                  <Select.Option key={trainer.id} value={trainer.id}>
                    {trainer.full_name}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: 'Please select a date' }]}
          >
            <DatePicker style={{ width: '100%' }} minDate={dayjs()} />
          </Form.Item>
          <Form.Item
            name="start_time"
            label="Start Time"
            rules={[{ required: true, message: 'Please select a start time' }]}
          >
            <TimePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="end_time"
            label="End Time"
            rules={[{ required: true, message: 'Please select an end time' }]}
          >
            <TimePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="capacity"
            label="Capacity"
            rules={[
              { required: true, message: 'Please enter capacity' },
              {
                type: 'number',
                min: 1,
                message: 'Capacity must be at least 1',
              },
            ]}
          >
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item name="is_cancelled" label="Status" initialValue={false}>
            <Select>
              <Select.Option value={false}>Active</Select.Option>
              <Select.Option value={true}>Cancelled</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default SchedulesPage;
