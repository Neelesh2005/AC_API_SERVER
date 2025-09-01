const formatResponse = (status, message, data = null) => {
  return {
    status,
    message,
    data,
  };
};

export default formatResponse;
