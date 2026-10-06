import api from './api.js';

const data = (res) => res.data;

// Issues the certificate for a finished course (asking twice returns the same one)
export const claimCertificate = (courseId, recipientName) =>
  api.post(`/courses/${courseId}/certificate`, { recipientName }).then(data);

// Downloads the PDF. The request carries the login cookie, so it cannot be a plain <a href>.
export async function downloadCertificate(certificate) {
  let res;
  try {
    res = await api.get(`/certificates/${certificate._id}/pdf`, { responseType: 'blob' });
  } catch (err) {
    // an error body arrives as a Blob too: turn it back into JSON so getErrorMessage() can read it
    const blob = err.response?.data;
    if (blob instanceof Blob) {
      try {
        err.response.data = JSON.parse(await blob.text());
      } catch {
        err.response.data = {};
      }
    }
    throw err;
  }

  const url = URL.createObjectURL(res.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Deenlearn-Certificate-${certificate.code}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
