export const jsonToFormData = (json: any): FormData => {
  const formData = new FormData()
  for (const key in json) {
    if (json.hasOwnProperty(key)) {
      const value = json[key]
      if (typeof value === 'object' && value !== null) {
        formData.append(key, JSON.stringify(value))
      } else {
        formData.append(key, String(value))
      }
    }
  }
  return formData
}