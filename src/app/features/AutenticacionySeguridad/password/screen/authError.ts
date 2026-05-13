export function getApiErrorMessage(error: any, fallback: string) {
  const data = error?.data

  if (typeof data?.detail === 'string' && data.detail) {
    return data.detail
  }

  if (Array.isArray(data?.non_field_errors) && data.non_field_errors.length > 0) {
    return String(data.non_field_errors[0])
  }

  if (data && typeof data === 'object') {
    const firstValue = Object.values(data)[0]
    if (Array.isArray(firstValue) && firstValue.length > 0) {
      return String(firstValue[0])
    }
    if (typeof firstValue === 'string' && firstValue) {
      return firstValue
    }
  }

  return fallback
}
