import {
  activateClass,
  createClass,
  deactivateClass,
  getAllClasses,
  updateClass,
} from '@/services/service/classes';
import {
  ActionType,
  PageContainer,
  ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { Button, Form, Input, message, Modal, Space } from 'antd';
import { useRef, useState } from 'react';

const ClassesPage = () => {
  const actionRef = useRef<ActionType>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit'>('create');
  const [currentRecord, setCurrentRecord] = useState<API.Service.Class | null>(
    null,
  );
  const [form] = Form.useForm();

  const showCreateModal = () => {
    setModalType('create');
    setCurrentRecord(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = (record: API.Service.Class) => {
    setModalType('edit');
    setCurrentRecord(record);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      //duration: record.duration,
      //capacity: record.capacity,
    });
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      if (modalType === 'create') {
        await createClass(values);
        message.success('Class created successfully');
      } else {
        await updateClass(currentRecord!.id, values);
        message.success('Class updated successfully');
      }

      setIsModalVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDeactivate = async (id: number) => {
    try {
      await deactivateClass(id);
      message.success('Class deactivated successfully');
      actionRef.current?.reload();
    } catch (error) {
      message.error('Failed to deactivate class');
      console.error('Error:', error);
    }
  };

  const handleActivate = async (id: number) => {
    try {
      await activateClass(id);
      message.success('Class activated successfully');
      actionRef.current?.reload();
    } catch (error) {
      message.error('Failed to activate class');
      console.error('Error:', error);
    }
  };

  const columns: ProColumns<API.Service.Class>[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    // {
    //   title: 'Duration (minutes)',
    //   dataIndex: 'duration',
    //   key: 'duration',
    // },
    // {
    //   title: 'Capacity',
    //   dataIndex: 'capacity',
    //   key: 'capacity',
    // },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      valueEnum: {
        true: {
          text: 'Active',
          status: 'Success',
        },
        false: {
          text: 'Inactive',
          status: 'Error',
        },
      },
      render: (_, record) => (
        <span style={{ color: record.is_active ? 'green' : 'red' }}>
          {record.is_active ? 'Active' : 'Inactive'}
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
          {record.is_active ? (
            <Button
              type="primary"
              danger
              onClick={() => handleDeactivate(record.id)}
            >
              Deactivate
            </Button>
          ) : (
            <Button type="default" onClick={() => handleActivate(record.id)}>
              Activate
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.Service.Class>
        columns={columns}
        actionRef={actionRef}
        request={async () => {
          const data = await getAllClasses();
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
            Create New Class
          </Button>,
        ]}
        search={false}
      />

      <Modal
        title={modalType === 'create' ? 'Create Class' : 'Edit Class'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter a name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter a description' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          {/* <Form.Item
            name="duration"
            label="Duration (minutes)"
            rules={[{ required: true, message: 'Please enter duration' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="capacity"
            label="Capacity"
            rules={[{ required: true, message: 'Please enter capacity' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item> */}
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default ClassesPage;
