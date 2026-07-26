// Static regions database mapping representing Indonesia provinces, cities, districts, and zip codes for fallback
export const localIndonesiaData: Record<string, Record<string, Record<string, string[]>>> = {
  "Aceh": {
    "Banda Aceh": {
      "Baiturrahman": ["23241", "23244"],
      "Kuta Alam": ["23121", "23126"],
      "Meuraxa": ["23231"],
      "Jaya Baru": ["23232"],
      "Lueng Bata": ["23247"],
      "Kuta Raja": ["23127"],
      "Syiah Kuala": ["23111", "23115"],
      "Ulee Kareng": ["23118", "23119"],
      "Banda Raya": ["23238"]
    },
    "Sabang": {
      "Sukajaya": ["23511"],
      "Sukakarya": ["23512"]
    },
    "Lhokseumawe": {
      "Banda Sakti": ["24351", "24354"],
      "Blang Mangat": ["24355"],
      "Muara Dua": ["24352"],
      "Muara Satu": ["24353"]
    },
    "Langsa": {
      "Langsa Kota": ["24411"],
      "Langsa Barat": ["24415"],
      "Langsa Lama": ["24416"],
      "Langsa Timur": ["24417"],
      "Langsa Baro": ["24418"]
    },
    "Subulussalam": {
      "Simpang Kiri": ["24782"],
      "Penanggalan": ["24783"],
      "Rundeng": ["24784"],
      "Sultan Daulat": ["24785"],
      "Longkib": ["24786"]
    },
    "Aceh Besar": {
      "Darul Imarah": ["23352"],
      "Darussalam": ["23373"],
      "Ingin Jaya": ["23371"],
      "Krueng Barona Jaya": ["23373"],
      "Lhoknga": ["23387"],
      "Leupung": ["23381"],
      "Mesjid Raya": ["23381"],
      "Montasik": ["23362"],
      "Peukan Bada": ["23239"],
      "Seulimeum": ["23361"]
    },
    "Pidie": {
      "Sigli": ["24111"],
      "Sakti": ["24171"],
      "Mutiara": ["24151"],
      "Indrajaya": ["24181"],
      "Kembang Tanjong": ["24182"]
    },
    "Pidie Jaya": {
      "Meureudu": ["24186"],
      "Bandar Baru": ["24184"],
      "Trienggadeng": ["24187"],
      "Panteraja": ["24188"],
      "Ulim": ["24189"]
    },
    "Bireuen": {
      "Kota Juang": ["24251"],
      "Jeumpa": ["24261"],
      "Peusangan": ["24271"],
      "Juli": ["24262"],
      "Samalanga": ["24264"]
    },
    "Aceh Utara": {
      "Lhoksukon": ["24382"],
      "Dewantara": ["24394"],
      "Syamtalira Bayu": ["24391"],
      "Tanah Luas": ["24385"],
      "Matangkuli": ["24386"]
    },
    "Aceh Timur": {
      "Idi Rayeuk": ["24454"],
      "Peureulak": ["24462"],
      "Peunaron": ["24474"],
      "Rantau Selamat": ["24452"],
      "Simpang Ulim": ["24457"]
    },
    "Aceh Tamiang": {
      "Karang Baru": ["24476"],
      "Kejuruan Muda": ["24477"],
      "Manyak Payed": ["24478"],
      "Rantau": ["24479"],
      "Seruway": ["24475"]
    },
    "Aceh Tengah": {
      "Lut Tawar": ["24519"],
      "Bebesen": ["24552"],
      "Pegasing": ["24561"],
      "Kebayakan": ["24514"],
      "Silih Nara": ["24564"]
    },
    "Bener Meriah": {
      "Bukit": ["24581"],
      "Permata": ["24582"],
      "Timang Gajah": ["24583"],
      "Wih Pesam": ["24584"],
      "Bandar": ["24585"]
    },
    "Aceh Barat": {
      "Johan Pahlawan": ["23611"],
      "Meureubo": ["23681"],
      "Samatiga": ["23682"],
      "Arongan Lambalek": ["23652"],
      "Woyla": ["23657"]
    },
    "Nagan Raya": {
      "Suka Makmue": ["23661"],
      "Kuala": ["23662"],
      "Seunagan": ["23663"],
      "Darul Makmur": ["23665"],
      "Beutong": ["23666"]
    },
    "Aceh Jaya": {
      "Calang": ["23654"],
      "Krueng Sabee": ["23655"],
      "Panga": ["23656"],
      "Teunom": ["23657"],
      "Setia Bakti": ["23658"]
    },
    "Aceh Barat Daya": {
      "Blangpidie": ["23764"],
      "Susoh": ["23765"],
      "Manggeng": ["23766"],
      "Tangan-Tangan": ["23767"],
      "Babah Rot": ["23768"]
    },
    "Aceh Selatan": {
      "Tapaktuan": ["23711"],
      "Labuhan Haji": ["23761"],
      "Meukek": ["23754"],
      "Sama Dua": ["23752"],
      "Kluet Utara": ["23772"]
    },
    "Aceh Singkil": {
      "Singkil": ["24785"],
      "Gunung Meriah": ["24791"],
      "Simpang Kanan": ["24784"],
      "Danau Paris": ["24792"],
      "Pulau Banyak": ["24795"]
    },
    "Simeulue": {
      "Simeulue Timur": ["23891"],
      "Simeulue Tengah": ["23892"],
      "Teupah Barat": ["23893"],
      "Teupah Selatan": ["23894"],
      "Salang": ["23895"]
    },
    "Gayo Lues": {
      "Blangkejeren": ["24653"],
      "Kutapanjang": ["24654"],
      "Rikit Gaib": ["24655"],
      "Terangun": ["24656"],
      "Pining": ["24657"]
    }
  }
};

export const normalizeName = (name: string) => {
  if (!name) return "";
  return name.toUpperCase()
    .replace(/^(KABUPATEN|KOTA)\s+/, "")
    .trim();
};

export const getLocalProvinceData = (provName: string) => {
  const normProv = normalizeName(provName);
  const provKey = Object.keys(localIndonesiaData).find(k => normalizeName(k) === normProv);
  return provKey ? localIndonesiaData[provKey] : null;
};

export const getLocalCityData = (provName: string, cityName: string) => {
  const provData = getLocalProvinceData(provName);
  if (!provData) return null;
  const normCity = normalizeName(cityName);
  const cityKey = Object.keys(provData).find(k => normalizeName(k) === normCity);
  return cityKey ? provData[cityKey] : null;
};

export const getLocalSubdistrictData = (provName: string, cityName: string, subName: string) => {
  const cityData = getLocalCityData(provName, cityName);
  if (!cityData) return null;
  const normSub = normalizeName(subName);
  const subKey = Object.keys(cityData).find(k => normalizeName(k) === normSub);
  return subKey ? cityData[subKey] : null;
};
