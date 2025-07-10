
/*const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

if (process.env.NODE_ENV === 'test') {
  sequelize = new Sequelize('sqlite::memory:', {
    logging: false
  });
} else {
  
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: 'postgres',
      port: process.env.DB_PORT || 5432,
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      define: {
        timestamps: true
      },
      dialectOptions:
        process.env.DB_SSL === 'true'
          ? {
              ssl: {
                require: true,
                rejectUnauthorized: false
              }
            }
          : {}
    }
  );
}

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };

const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

if (process.env.NODE_ENV === 'test') {
  // Use an in-memory SQLite DB for tests
  sequelize = new Sequelize('sqlite::memory:', {
    logging: false
  });
} else {
  // Use the single DATABASE_URL environment variable in production or development
  sequelize = new Sequelize(process.env.DB_URL, {
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
}

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };

const { Sequelize } = require('sequelize');
const fs = require('fs');
require('dotenv').config();

let sequelize;

if (process.env.NODE_ENV === 'test') {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false
  });
} else {
  // Read Aiven CA cert from a local file, or paste directly if needed
  //const caCert = fs.readFileSync(__dirname +'/ca.pem').toString(); // or embed the cert as a string
  // console.log(caCert);
  //const caCert =process.env.CA_PEM.toString();

  sequelize = new Sequelize(process.env.DB_URL, {
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      }
    }
  });
}

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };

*/
const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;
if (process.env.NODE_ENV === 'test') {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false
  });
} else {
  sequelize = new Sequelize(process.env.DB_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: true,
        ca: `-----BEGIN CERTIFICATE-----
MIIEUDCCArigAwIBAgIUfxDsSTqBF8CPgLwFuzRp24L9LfcwDQYJKoZIhvcNAQEM
BQAwQDE+MDwGA1UEAww1YmM4ZjIzMDYtYzJjNi00MTNjLWI2MjUtZjkzYTIxZTNl
ZmU4IEdFTiAxIFByb2plY3QgQ0EwHhcNMjUwNzEwMTgzMTU3WhcNMzUwNzA4MTgz
MTU3WjBAMT4wPAYDVQQDDDViYzhmMjMwNi1jMmM2LTQxM2MtYjYyNS1mOTNhMjFl
M2VmZTggR0VOIDEgUHJvamVjdCBDQTCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCC
AYoCggGBALsiwNKyd8unnYmKDmByhuhXv46k5hd1u+rHDp3LUvlMgKkfQBK4xYXf
ggUo9zk/cD60ee85BZTLfrZodChs/t05iC5pSbgzbGCIMMbFEi4pt8m/Nye2hg2c
hP1ELBFLtool0u7Kuxd/hm1h89rOGCDg0SiOuUWvDkrlnI8RxYV27Xp54EncthK8
xQOm5eKojjeHYDlCmb//ZkkQO+MtVtTN6OMeFoxLE9Bs8c9Hp2XgueJnp3ykOrXO
G0zvt1W66P5+GrIvXS1vpjxMVS9/CoW3to/l4RZ0MKLOmzyhHM0dwxYQ6NDWMaT4
qdJDHplkT7R7hs0dDfSRlV5jJyqkoLSjD8lrOSuAhcJv76q10+sULDeToTrtv9AB
wsCD0L0kTUAe4NXDGN1IeAoqSOHZh/ymGRE1rylEwsNleiJhzdF8ys+4oAuybUkP
IkcbGQ1XjEoKF6GK2wd09wZuikv57YrTaPcHN/adwxbmcJMUg4w+ELxD5+L+bpMh
uJshyr/bUwIDAQABo0IwQDAdBgNVHQ4EFgQUnVTPy3goWEJddBgVdnlss7ZAp64w
EgYDVR0TAQH/BAgwBgEB/wIBADALBgNVHQ8EBAMCAQYwDQYJKoZIhvcNAQEMBQAD
ggGBAKLHKeMOrv+ws8mj/wY9CUzMj4/fZV6hIe70sL6kMe0b1jlnpAD5Nw2jrRPF
CANlmFkY2/D2doak7zExiRSqThqsYVEkkw+ZzSCf85pxDVcSEAlfoYdzTlePj2Oh
GdDrBl8/J5RJAwAb+bXJm225E3UKbyWLte2sLBOSX3A4vcQa6GWxiVKBySharATM
HgFcCHoCVn2iTaUgjuctTk6aO6hbWsz833DVWm9R+6gq8XTmZJ3bdjqqwlIbCIz9
oczeJwIR80AoOIxLKPZFaVYQZLwdJONvwBGhopcCgx3lIDgBApM84IufDhUPHaiO
JgfRYdQaDItlU/eSqZQV+DjXw/1nAIEGvd6PzJg7z2YPX3sjYYv/syb9M+f9taJy
UOG5eVaclYooUl+8gy3sYnSwUAE6fl5WT7ffyHPbVsT7hKwm+GRAknOPzaUxkmdH
3emhOQ9HSPkqStNgc6Bg9ObjKD5cd4pkqjaHnByQI4aOZ2GPHB7/GOU6gaD+jmwb
60khLw==
-----END CERTIFICATE-----`
      }
    }
  });
}

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };