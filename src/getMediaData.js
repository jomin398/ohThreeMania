export default function getMediaData(blob) {
    const jsmediatags = window.jsmediatags;
    return new Promise((resolve, reject) => {
      jsmediatags
        .read(blob, {
          onSuccess: (tag) => {
            console.log('Success!');
            resolve(tag);
          },
          onError: (error) => {
            console.log('Error');
            reject(error);
          }
        });
    })
      .then(tagInfo => {
        // handle the onSuccess return
        let { title, artist, picture } = tagInfo.tags;
        let pUrl = null;
        if (picture) {
          const { data, type } = picture;
          const byteArray = new Uint8Array(data);
          const blob = new Blob([byteArray], { type });
          pUrl = URL.createObjectURL(blob);
        }
        return { title, artist, pUrl };
      })
      .catch(error => {
        // handle errors
      });
  };