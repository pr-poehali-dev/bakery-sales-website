import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import * as XLSX from 'xlsx';

interface Product {
  id: number;
  name: string;
  category: string;
  emoji: string;
  sales: number;
  price: number;
}

const INITIAL_PRODUCTS: Product[] = [
  { id: 1, name: 'Пирожок с капустой', category: 'Пирожки', emoji: '🥟', sales: 0, price: 45 },
  { id: 2, name: 'Пирожок с картошкой', category: 'Пирожки', emoji: '🥔', sales: 0, price: 45 },
  { id: 3, name: 'Пирожок с мясом', category: 'Пирожки', emoji: '🥩', sales: 0, price: 55 },
  { id: 4, name: 'Чебурек с мясом', category: 'Пирожки', emoji: '🌮', sales: 0, price: 80 },
  { id: 5, name: 'Чебурек с сыром', category: 'Пирожки', emoji: '🧀', sales: 0, price: 75 },
  { id: 6, name: 'Хачапури с сыром', category: 'Пирожки', emoji: '🍕', sales: 0, price: 120 },
  { id: 7, name: 'Хачапури с сыром и зеленью', category: 'Пирожки', emoji: '🥬', sales: 0, price: 130 },
  { id: 8, name: 'Хачапури с мясом', category: 'Пирожки', emoji: '🍖', sales: 0, price: 140 },
  { id: 9, name: 'Матнакаш', category: 'Пирожки', emoji: '🍞', sales: 0, price: 90 },
  { id: 10, name: 'Армянский тонкий лаваш', category: 'Пирожки', emoji: '🫓', sales: 0, price: 60 },
  { id: 11, name: 'Хлеб ржаной', category: 'Пирожки', emoji: '🍞', sales: 0, price: 50 },
  { id: 12, name: 'Хлеб рижский', category: 'Пирожки', emoji: '🥖', sales: 0, price: 55 },
  { id: 13, name: 'Хлеб черный с семечками', category: 'Пирожки', emoji: '🌾', sales: 0, price: 60 },
  
  { id: 14, name: 'Эспрессо', category: 'Кофе и Чай', emoji: '☕', sales: 0, price: 80 },
  { id: 15, name: 'Капучино', category: 'Кофе и Чай', emoji: '☕', sales: 0, price: 120 },
  { id: 16, name: 'Латте', category: 'Кофе и Чай', emoji: '🥛', sales: 0, price: 130 },
  { id: 17, name: 'Американо', category: 'Кофе и Чай', emoji: '☕', sales: 0, price: 90 },
  { id: 18, name: 'Флэт уайт', category: 'Кофе и Чай', emoji: '🤍', sales: 0, price: 140 },
  { id: 19, name: 'Раф', category: 'Кофе и Чай', emoji: '☕', sales: 0, price: 150 },
  { id: 20, name: 'Кофе на песке', category: 'Кофе и Чай', emoji: '🏖️', sales: 0, price: 200 },
  { id: 21, name: 'Чай пакетированный', category: 'Кофе и Чай', emoji: '🍵', sales: 0, price: 60 },
  { id: 22, name: 'Лавандовый раф', category: 'Кофе и Чай', emoji: '💜', sales: 0, price: 170 },
  { id: 23, name: 'Облепиховый чай', category: 'Кофе и Чай', emoji: '🍊', sales: 0, price: 150 },
  
  { id: 24, name: 'Шоколадный кекс', category: 'Сладкое', emoji: '🧁', sales: 0, price: 70 },
  { id: 25, name: 'Армянская пахлава', category: 'Сладкое', emoji: '🍯', sales: 0, price: 100 },
  { id: 26, name: 'Чизкейк классический', category: 'Сладкое', emoji: '🍰', sales: 0, price: 180 },
  { id: 27, name: 'Чизкейк шоколадный', category: 'Сладкое', emoji: '🍫', sales: 0, price: 190 },
  { id: 28, name: 'Наполеон', category: 'Сладкое', emoji: '🎂', sales: 0, price: 150 },
  { id: 29, name: 'Медовик', category: 'Сладкое', emoji: '🍯', sales: 0, price: 140 },
  { id: 30, name: 'Булочки с изюмом, маком', category: 'Сладкое', emoji: '🥐', sales: 0, price: 50 },
  { id: 31, name: 'Пончики', category: 'Сладкое', emoji: '🍩', sales: 0, price: 60 },
  { id: 32, name: 'Сушки', category: 'Сладкое', emoji: '🥨', sales: 0, price: 40 },
  { id: 33, name: 'Печенье монетки', category: 'Сладкое', emoji: '🪙', sales: 0, price: 35 },
  { id: 34, name: 'Печенье с джемом', category: 'Сладкое', emoji: '🍓', sales: 0, price: 45 },
  { id: 35, name: 'Козинаки в шоколаде', category: 'Сладкое', emoji: '🍫', sales: 0, price: 80 },
  
  { id: 36, name: 'Твистер', category: 'Кухня', emoji: '🌯', sales: 0, price: 180 },
  { id: 37, name: 'Твистер де люкс', category: 'Кухня', emoji: '🌯', sales: 0, price: 220 },
  { id: 38, name: 'Бургер', category: 'Кухня', emoji: '🍔', sales: 0, price: 190 },
  { id: 39, name: 'Бургер де люкс', category: 'Кухня', emoji: '🍔', sales: 0, price: 240 },
  { id: 40, name: 'Картофель фри средний', category: 'Кухня', emoji: '🍟', sales: 0, price: 90 },
  { id: 41, name: 'Картофель фри большой', category: 'Кухня', emoji: '🍟', sales: 0, price: 120 },
  { id: 42, name: 'Комбо', category: 'Кухня', emoji: '🍽️', sales: 0, price: 350 },
  
  { id: 43, name: 'Добрый кола', category: 'Напитки', emoji: '🥤', sales: 0, price: 70 },
  { id: 44, name: 'Азвкус сок', category: 'Напитки', emoji: '🧃', sales: 0, price: 80 },
  { id: 45, name: 'Аскания', category: 'Напитки', emoji: '💧', sales: 0, price: 60 },
  { id: 46, name: 'Вода негазированная святой источник', category: 'Напитки', emoji: '💧', sales: 0, price: 50 },
];

const CATEGORY_EMOJIS = {
  'Пирожки': '🍽️',
  'Кофе и Чай': '☕',
  'Сладкое': '🍰',
  'Кухня': '🍔',
  'Напитки': '🥤'
};

const Index = () => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('bakery-sales');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('bakery-sales', JSON.stringify(products));
  }, [products]);

  const updateSales = (id: number, delta: number) => {
    setProducts(prev =>
      prev.map(p => p.id === id ? { ...p, sales: Math.max(0, p.sales + delta) } : p)
    );
  };

  const categories = useMemo(() => {
    return Object.keys(CATEGORY_EMOJIS);
  }, []);

  const filteredProducts = useMemo(() => {
    return selectedCategory 
      ? products.filter(p => p.category === selectedCategory)
      : products;
  }, [products, selectedCategory]);

  const stats = useMemo(() => {
    const totalSales = products.reduce((sum, p) => sum + p.sales, 0);
    const totalRevenue = products.reduce((sum, p) => sum + (p.sales * p.price), 0);
    const topProducts = [...products].sort((a, b) => b.sales - a.sales).slice(0, 3);
    const categorySales = categories.map(cat => ({
      category: cat,
      sales: products.filter(p => p.category === cat).reduce((sum, p) => sum + p.sales, 0)
    }));
    const maxCategorySales = Math.max(...categorySales.map(c => c.sales), 1);
    
    return { totalSales, totalRevenue, topProducts, categorySales, maxCategorySales };
  }, [products, categories]);

  const resetSales = () => {
    if (window.confirm('Сбросить все продажи?')) {
      setProducts(INITIAL_PRODUCTS);
    }
  };

  const exportToExcel = () => {
    const exportData = products.map(p => ({
      'Категория': p.category,
      'Товар': p.name,
      'Цена (₽)': p.price,
      'Продано (шт)': p.sales,
      'Выручка (₽)': p.sales * p.price
    }));

    const categorySummary = categories.map(cat => {
      const catProducts = products.filter(p => p.category === cat);
      return {
        'Категория': cat,
        'Товар': 'ИТОГО',
        'Цена (₽)': '',
        'Продано (шт)': catProducts.reduce((sum, p) => sum + p.sales, 0),
        'Выручка (₽)': catProducts.reduce((sum, p) => sum + (p.sales * p.price), 0)
      };
    });

    const totalRow = {
      'Категория': 'ВСЕГО',
      'Товар': '',
      'Цена (₽)': '',
      'Продано (шт)': stats.totalSales,
      'Выручка (₽)': stats.totalRevenue
    };

    const ws = XLSX.utils.json_to_sheet([...exportData, {}, ...categorySummary, {}, totalRow]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Продажи');
    
    const date = new Date().toLocaleDateString('ru-RU').replace(/\./g, '-');
    XLSX.writeFile(wb, `Продажи_пекарни_${date}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-orange-600 mb-2">
            🥐 Учёт продаж пекарни
          </h1>
          <p className="text-gray-600 text-lg">Отслеживайте популярность каждого товара</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-orange-200 shadow-lg animate-scale-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Всего продаж</span>
                <Icon name="TrendingUp" className="text-orange-500" size={24} />
              </div>
              <p className="text-4xl font-heading font-bold text-orange-600">{stats.totalSales}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-green-200 shadow-lg animate-scale-in" style={{ animationDelay: '0.05s' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Выручка</span>
                <Icon name="DollarSign" className="text-green-500" size={24} />
              </div>
              <p className="text-3xl font-heading font-bold text-green-600">{stats.totalRevenue.toLocaleString('ru-RU')} ₽</p>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg animate-scale-in" style={{ animationDelay: '0.15s' }}>
            <CardContent className="p-6">
              <h3 className="font-heading font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Icon name="Award" className="text-purple-500" size={20} />
                Топ-3 товара
              </h3>
              <div className="space-y-3">
                {stats.topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center gap-3">
                    <Badge className="text-2xl bg-purple-100 hover:bg-purple-100 text-purple-800 font-heading">
                      {index + 1}
                    </Badge>
                    <span className="text-2xl">{product.emoji}</span>
                    <span className="flex-1 font-medium text-gray-700">{product.name}</span>
                    <Badge variant="secondary" className="bg-purple-50 text-purple-700">
                      {product.sales}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-orange-200 shadow-lg mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <CardContent className="p-6">
            <h3 className="font-heading font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Icon name="BarChart3" className="text-orange-500" size={20} />
              Продажи по категориям
            </h3>
            <div className="space-y-4">
              {stats.categorySales.map(({ category, sales }) => (
                <div key={category}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-700 flex items-center gap-2">
                      <span className="text-xl">{CATEGORY_EMOJIS[category as keyof typeof CATEGORY_EMOJIS]}</span>
                      {category}
                    </span>
                    <span className="text-orange-600 font-semibold">{sales}</span>
                  </div>
                  <Progress 
                    value={(sales / stats.maxCategorySales) * 100} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 mb-6 overflow-x-auto pb-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(null)}
            className="whitespace-nowrap"
          >
            Все товары
          </Button>
          {categories.map(cat => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(cat)}
              className="whitespace-nowrap gap-2"
            >
              <span>{CATEGORY_EMOJIS[cat as keyof typeof CATEGORY_EMOJIS]}</span>
              {cat}
            </Button>
          ))}
          <Button
            onClick={exportToExcel}
            className="whitespace-nowrap ml-auto gap-2 bg-green-500 hover:bg-green-600"
          >
            <Icon name="Download" size={16} />
            Экспорт в Excel
          </Button>
          <Button
            variant="destructive"
            onClick={resetSales}
            className="whitespace-nowrap gap-2"
          >
            <Icon name="RotateCcw" size={16} />
            Сбросить
          </Button>
        </div>

        <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {filteredProducts.map((product, index) => (
            <Card 
              key={product.id} 
              className="break-inside-avoid bg-white/90 backdrop-blur-sm border-amber-200 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-fade-in group"
              style={{ animationDelay: `${0.4 + index * 0.02}s` }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="text-4xl mb-2">{product.emoji}</div>
                    <h3 className="font-medium text-gray-800 text-sm leading-tight mb-1">
                      {product.name}
                    </h3>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs bg-amber-50 border-amber-300 text-amber-700">
                        {product.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-green-50 border-green-300 text-green-700 font-semibold">
                        {product.price} ₽
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className="bg-orange-500 hover:bg-orange-600 text-white font-heading text-lg px-3 py-1">
                      {product.sales}
                    </Badge>
                    {product.sales > 0 && (
                      <span className="text-xs text-green-600 font-semibold">
                        {(product.sales * product.price).toLocaleString('ru-RU')} ₽
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateSales(product.id, -1)}
                    disabled={product.sales === 0}
                    className="flex-1 border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400 transition-all"
                  >
                    <Icon name="Minus" size={16} />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => updateSales(product.id, 1)}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg transition-all animate-pulse-soft"
                  >
                    <Icon name="Plus" size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;