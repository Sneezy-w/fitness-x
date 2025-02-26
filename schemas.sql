CREATE TABLE Member (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  stripe_customer_id VARCHAR(255),
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE Trainer (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  specialization VARCHAR(255),
  experience_years INT,
  is_approved BOOLEAN DEFAULT false,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE MembershipType (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) UNIQUE NOT NULL, -- free, basic, premium
  monthly_price DECIMAL(10,2),
  class_limit INT,
  is_active BOOLEAN DEFAULT true,
  deleted_at DATETIME
);

CREATE TABLE MembershipSubscription (
  id INT PRIMARY KEY AUTO_INCREMENT,
  member_id INT NOT NULL,
  membership_type_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  stripe_subscription_id VARCHAR(255) NOT NULL,
  remaining_classes INT NOT NULL,
  FOREIGN KEY (member_id) REFERENCES Member(id),
  FOREIGN KEY (membership_type_id) REFERENCES MembershipType(id)
);

CREATE TABLE FreeClassAllocation (
  id INT PRIMARY KEY AUTO_INCREMENT,
  member_id INT NOT NULL,
  quantity INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES Member(id)
);

CREATE TABLE Class (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  capacity INT NOT NULL,
  duration_minutes INT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  deleted_at DATETIME
);

CREATE TABLE Schedule (
  id INT PRIMARY KEY AUTO_INCREMENT,
  class_id INT NOT NULL,
  trainer_id INT NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  is_cancelled BOOLEAN DEFAULT false,
  FOREIGN KEY (class_id) REFERENCES Class(id),
  FOREIGN KEY (trainer_id) REFERENCES Trainer(id)
);

CREATE TABLE Booking (
  id INT PRIMARY KEY AUTO_INCREMENT,
  member_id INT NOT NULL,
  schedule_id INT NOT NULL,
  booked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_attended BOOLEAN DEFAULT false,
  used_free_class BOOLEAN DEFAULT false,
  FOREIGN KEY (member_id) REFERENCES Member(id),
  FOREIGN KEY (schedule_id) REFERENCES Schedule(id)
);

CREATE TABLE PaymentHistory (
  id INT PRIMARY KEY AUTO_INCREMENT,
  member_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  stripe_payment_id VARCHAR(255) NOT NULL,
  payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES Member(id)
);