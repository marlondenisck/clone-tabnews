const READ_ACTIVATION_TOKEN = "read:activation_token";
const CREATE_SESSION = "create:session";
const CREATE_USER = "create:user";
const READ_SESSION = "read:session";
const UPDATE_USER = "update:user";
const UPDATE_USER_OTHERS = "update:user:others";
const READ_USER = "read:user";
const READ_USER_SELF = "read:user:self";
const READ_MIGRATION = "read:migration";
const CREATE_MIGRATION = "create:migration";
const READ_STATUS = "read:status";
const READ_STATUS_ALL = "read:status:all";

const availableFeatures = {
  READ_ACTIVATION_TOKEN,
  CREATE_SESSION,
  READ_SESSION,
  CREATE_USER,
  UPDATE_USER,
  UPDATE_USER_OTHERS,
  READ_USER,
  READ_USER_SELF,
  READ_MIGRATION,
  CREATE_MIGRATION,
  READ_STATUS,
  READ_STATUS_ALL,
};

export default availableFeatures;
