/**
 * Cracker House X Snuggle Collaboration API Communication Module
 */
const API_BASE = "http://localhost:8000/api";

const ApiService = {
  // ── ☕ 팝업 및 체험존 정보 ──
  async getPopupInfo() {
    try {
      const response = await fetch(`${API_BASE}/popup`);
      if (!response.ok) throw new Error("팝업 정보를 불러오지 못했습니다.");
      return await response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  async getPopupZones() {
    try {
      const response = await fetch(`${API_BASE}/popup/zones`);
      if (!response.ok) throw new Error("체험존 정보를 불러오지 못했습니다.");
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  // ── 👕 상품 정보 ──
  async getProducts(brand = null, category = null) {
    const allProducts = [
      { id: 1, name: "크래커하우스 빈티지 피그먼트 티셔츠", description: "부드러운 워싱이 돋보이는 오버핏 피그먼트 반팔 티셔츠", price: 45000, brand: "KRACKER_HOUSE", category: "Apparel", stock: 100, image_url: "snuggle_photo_sample.jpg" },
      { id: 2, name: "크래커하우스 백로고 티셔츠", description: "뒷면 그래픽 로고 포인트 시그니처 옐로우 티셔츠", price: 42000, brand: "KRACKER_HOUSE", category: "Apparel", stock: 50, image_url: "brand_photo.jpg" },
      { id: 3, name: "크래커하우스 헤비웨이트 피그먼트 후디", description: "도톰한 탄력감과 투박한 워크웨어 라인의 후드 집업", price: 89000, brand: "KRACKER_HOUSE", category: "Apparel", stock: 65, image_url: "brand_editorial.jpg" },
      { id: 4, name: "크래커하우스 워크웨어 데님 카펜터 팬츠", description: "견고한 스티치 디테일의 빈티지 스트레이트 데님", price: 98000, brand: "KRACKER_HOUSE", category: "Apparel", stock: 40, image_url: "snuggle_photo_sample.jpg" },
      { id: 5, name: "크래커하우스 x 스너글 콜라보 에코백", description: "두 브랜드 감성이 담긴 리미티드 캔버스 백", price: 29000, brand: "KRACKER_HOUSE", category: "Accessories", stock: 200, image_url: "brand_photo.jpg" },
      { id: 6, name: "스너글 빈티지 바닐라 섬유유연제", description: "갓 세탁한 맑은 향과 포근한 가을 바닐라 잔향의 조화", price: 16500, brand: "SNUGGLE", category: "Care", stock: 500, image_url: "brand_editorial.jpg" },
      { id: 7, name: "스너글 블루 스파클 룸스프레이", description: "공간을 깨끗하고 시원하게 채워주는 섬유 향수", price: 18000, brand: "SNUGGLE", category: "Care", stock: 150, image_url: "snuggle_photo_sample.jpg" },
      { id: 8, name: "스너글 베어 한정판 인형", description: "콜라보레이션 기념 한정판 포근한 스너글 베어 굿즈", price: 22000, brand: "SNUGGLE", category: "Goods", stock: 30, image_url: "brand_photo.jpg" }
    ];

    const getFilteredMock = () => {
      let filtered = allProducts;
      if (brand) {
        const b = brand.toUpperCase();
        if (b.includes("KRACKER") || b.includes("CRACKER")) {
          filtered = filtered.filter(p => p.brand.includes("KRACKER") || p.brand.includes("CRACKER"));
        } else if (b.includes("SNUGGLE")) {
          filtered = filtered.filter(p => p.brand.includes("SNUGGLE"));
        }
      }
      return { total: filtered.length, items: filtered };
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 800);
      let url = `${API_BASE}/products?`;
      if (brand) url += `brand=${brand}&`;
      if (category) url += `category=${category}&`;
      
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!response.ok) return getFilteredMock();
      const data = await response.json();
      if (!data || !data.items || data.items.length === 0) return getFilteredMock();
      return data;
    } catch (error) {
      return getFilteredMock();
    }
  },

  async getProductDetail(id) {
    try {
      const response = await fetch(`${API_BASE}/products/${id}`);
      if (!response.ok) throw new Error("상품 상세 정보를 불러오지 못했습니다.");
      return await response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  // ── 📅 예약 및 현장 대기 (모바일 백엔드 서비스 API) ──
  async getSlotAvailability(dateStr) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 600);
      const response = await fetch(`${API_BASE}/reservations/slots?date=${dateStr}`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (response.ok) return await response.json();
    } catch (e) {}

    // Mock Backend Data Engine
    let localRes = [];
    try {
      const stored = localStorage.getItem('kracker_pre_res');
      if (stored) localRes = JSON.parse(stored);
    } catch (e) {}

    const timeSlots = ["10:00", "11:30", "13:00", "14:30", "16:00", "17:30", "19:00", "20:00"];
    const slotData = timeSlots.map(time => {
      const bookedCount = localRes
        .filter(r => r.reservation_date === dateStr && r.reservation_time === time && r.status !== 'CANCELLED')
        .reduce((sum, r) => sum + (parseInt(r.people_count) || 1), 0);
      const maxCap = 40;
      const rem = Math.max(0, maxCap - bookedCount - Math.floor(Math.random() * 5));
      let status = "AVAILABLE";
      if (rem === 0) status = "SOLD_OUT";
      else if (rem <= 8) status = "FEW_LEFT";
      return { time, remaining: rem, status, max_capacity: maxCap };
    });

    return { success: true, date: dateStr, slots: slotData };
  },

  async createPreReservation(name, phone, email, reservationDate, reservationTime, peopleCount, perks = {}) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 800);
      const response = await fetch(`${API_BASE}/reservations/pre`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email: email || null,
          reservation_date: reservationDate,
          reservation_time: reservationTime,
          people_count: parseInt(peopleCount),
          perks
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data.detail || "예약에 실패했습니다." };
      }
      return { success: true, data };
    } catch (error) {
      console.warn("Backend API simulation active. Processing reservation locally.");
      
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const formattedPhone = cleanPhone.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-$2-$3');
      const ticketCode = 'KH-' + reservationDate.replace(/-/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);
      const barcode = '880' + Math.floor(100000000 + Math.random() * 900000000);

      const newReservation = {
        id: "RES-" + Date.now().toString(36).toUpperCase(),
        ticket_code: ticketCode,
        barcode: barcode,
        name: name.trim(),
        phone: formattedPhone || phone,
        email: email ? email.trim() : null,
        reservation_date: reservationDate,
        reservation_time: reservationTime,
        people_count: parseInt(peopleCount),
        scent_kit: perks.scent_kit || "스너글 허그블 선샤인 ☀️",
        photocard: perks.photocard || "크래커하우스 X 스너글 한정 포토카드 🧺",
        status: "CONFIRMED",
        qr_url: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ticketCode + '|' + name + '|' + reservationDate)}`,
        created_at: new Date().toLocaleString('ko-KR')
      };

      try {
        let stored = localStorage.getItem('kracker_pre_res');
        let list = stored ? JSON.parse(stored) : [];
        list.unshift(newReservation);
        localStorage.setItem('kracker_pre_res', JSON.stringify(list));
      } catch (e) {}

      // Simulate 400ms network delay for realistic backend feel
      await new Promise(res => setTimeout(res, 400));

      return { success: true, data: newReservation };
    }
  },

  async cancelReservation(ticketCode) {
    try {
      let stored = localStorage.getItem('kracker_pre_res');
      if (stored) {
        let list = JSON.parse(stored);
        let target = list.find(r => r.ticket_code === ticketCode || r.id === ticketCode);
        if (target) {
          target.status = 'CANCELLED';
          localStorage.setItem('kracker_pre_res', JSON.stringify(list));
          return { success: true, message: '예약이 취소되었습니다.' };
        }
      }
      return { success: false, message: '예약 내역을 찾을 수 없습니다.' };
    } catch (e) {
      return { success: false, message: '예약 취소 처리 중 오류가 발생했습니다.' };
    }
  },

  async createOnsiteReservation(name, phone, peopleCount) {
    try {
      const response = await fetch(`${API_BASE}/reservations/onsite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, people_count: parseInt(peopleCount) })
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data.detail || "대기 등록에 실패했습니다." };
      }
      return { success: true, data };
    } catch (error) {
      console.warn("Backend API unavailable. Saving kiosk waiting locally.");
      let kioskList = [];
      try {
        const stored = localStorage.getItem('kracker_kiosk_data');
        if (stored) kioskList = JSON.parse(stored);
      } catch (e) {}

      const waitingNum = 100 + kioskList.length + 1;
      const newReservation = {
        name: name,
        phone: phone,
        people_count: parseInt(peopleCount),
        waiting_number: waitingNum,
        ahead_count: kioskList.filter(k => k.status !== 'COMPLETED' && k.status !== 'CANCELLED').length,
        status: "WAITING",
        created_at: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
      };
      kioskList.unshift(newReservation);
      try {
        localStorage.setItem('kracker_kiosk_data', JSON.stringify(kioskList));
      } catch (e) {}
      return { success: true, data: newReservation };
    }
  },

  async getWaitingStatus(phone) {
    try {
      const response = await fetch(`${API_BASE}/reservations/waiting-status/${phone}`);
      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data.detail || "대기 조회를 할 수 없습니다." };
      }
      return { success: true, data };
    } catch (error) {
      let kioskList = [];
      try {
        const stored = localStorage.getItem('kracker_kiosk_data');
        if (stored) kioskList = JSON.parse(stored);
      } catch (e) {}

      const found = kioskList.find(r => r.phone === phone);
      if (found) {
        return { success: true, data: found };
      }
      return { success: false, message: "등록된 대기 정보가 없습니다." };
    }
  },

  async getMyPreReservations(phone) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 800);
      const response = await fetch(`${API_BASE}/reservations/my?phone=${phone}`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error("예약 내역 조회에 실패했습니다.");
      return await response.json();
    } catch (error) {
      let localRes = [];
      try {
        let stored = localStorage.getItem('kracker_pre_res');
        if (stored) localRes = JSON.parse(stored);
      } catch (e) {}
      
      const found = localRes.filter(r => r.phone === phone);
      return { total: found.length, items: found };
    }
  }
};
