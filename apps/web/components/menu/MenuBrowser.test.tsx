import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Product } from '@/lib/types';
import MenuBrowser from './MenuBrowser';

// Trang menu (Task 4.3): kiểm tra đủ 4 trạng thái đang tải, lỗi, rỗng, có dữ liệu và tìm kiếm không dấu.
// Thay hook gọi API bằng giá trị giả để test chạy không cần backend.
const productsState = vi.hoisted(() => ({ current: {} as Record<string, unknown> }));

vi.mock('@/lib/products', () => ({ useProducts: () => productsState.current }));
vi.mock('@/lib/favorites', () => ({ useFavorites: () => ({ favorites: [], signedIn: false }) }));
// Thẻ món có giỏ hàng, ảnh, yêu thích... đã có trang riêng; ở đây chỉ cần biết món nào được hiện
vi.mock('./ProductCard', () => ({ default: ({ product }: { product: Product }) => <article data-testid="product">{product.name}</article> }));

function product(id: string, name: string, extra: Partial<Product> = {}): Product {
  return {
    id,
    name,
    description: '',
    price: 30000,
    imageUrl: '',
    stock: 10,
    category: 'truyen-thong',
    kind: 'drink',
    tag: null,
    rating: 5,
    sold: 0,
    hasIce: true,
    color: '#6f4e37',
    keywords: [],
    toppings: [],
    ...extra,
  };
}

const MENU = [product('bac-xiu', 'Bạc xỉu', { sold: 30 }), product('ca-phe-sua-da', 'Cà phê sữa đá', { sold: 20 }), product('croissant', 'Bánh croissant', { kind: 'food', category: 'banh-ngot', sold: 10 })];

const state = (s: Record<string, unknown>) => {
  productsState.current = { data: undefined, isLoading: false, isError: false, error: null, refetch: vi.fn(), isFetching: false, ...s };
};

describe('MenuBrowser', () => {
  beforeEach(() => state({ data: MENU }));

  it('đang tải: hiện khung chờ, chưa hiện món', () => {
    state({ isLoading: true });
    render(<MenuBrowser title="Thực đơn" />);
    expect(screen.getByLabelText('Đang tải thực đơn')).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryAllByTestId('product')).toHaveLength(0);
  });

  it('lỗi: hiện thông báo, bấm "Thử lại" thì gọi lại API', () => {
    const refetch = vi.fn();
    state({ isError: true, error: new Error('Không kết nối được máy chủ.'), refetch });
    render(<MenuBrowser title="Thực đơn" />);
    expect(screen.getByText('Không tải được thực đơn')).toBeInTheDocument();
    expect(screen.getByText('Không kết nối được máy chủ.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Thử lại' }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('rỗng: thực đơn không có món thì báo đang cập nhật', () => {
    state({ data: [] });
    render(<MenuBrowser title="Thực đơn" />);
    expect(screen.getByText('Thực đơn đang được cập nhật')).toBeInTheDocument();
  });

  it('có dữ liệu: hiện mọi món, món bán chạy trước', () => {
    render(<MenuBrowser title="Thực đơn" />);
    expect(screen.getAllByTestId('product').map((el) => el.textContent)).toEqual(['Bạc xỉu', 'Cà phê sữa đá', 'Bánh croissant']);
  });

  it('lọc theo danh mục chỉ còn món của danh mục đó', () => {
    render(<MenuBrowser title="Thực đơn" />);
    fireEvent.click(screen.getByRole('button', { name: 'Bánh ngọt' }));
    expect(screen.getAllByTestId('product').map((el) => el.textContent)).toEqual(['Bánh croissant']);
  });

  it('tìm không dấu: gõ "bx" ra Bạc xỉu', () => {
    render(<MenuBrowser title="Thực đơn" initialQuery="bx" />);
    expect(screen.getAllByTestId('product').map((el) => el.textContent)).toEqual(['Bạc xỉu']);
  });

  it('tìm không ra món: hiện gợi ý và nút xem toàn bộ thực đơn', () => {
    render(<MenuBrowser title="Thực đơn" initialQuery="zzzz" />);
    expect(screen.getByText(/Không có món nào khớp/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Xem toàn bộ thực đơn' }));
    expect(screen.getAllByTestId('product')).toHaveLength(3);
  });
});
