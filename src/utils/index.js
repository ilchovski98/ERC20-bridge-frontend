export function truncate(str, n) {
  return str.length > n
    ? str.substr(0, n - 1) + '...' + str.substr(str.length - 4, str.length - 1)
    : str;
}

export function handleErrorMessage(error, setErrorMessage) {
  const errorMessage = error.errorName
    ? `Execution reverted with error: ${error.errorName}!`
    : error.reason;
  setErrorMessage(errorMessage?.includes('user rejected transaction') ? '' : errorMessage);
}
