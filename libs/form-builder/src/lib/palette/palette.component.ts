import { Component, computed, signal, OnInit, inject } from '@angular/core';

import { BUILDER_CONFIG, type BuilderConfig } from '../tokens';
import { BuilderRegistryService } from '../registry/builder-registry.service';
import { ComponentDescriptor } from '../types';
import { PaletteSearchComponent } from './palette-search.component';
import { PaletteGroupComponent } from './palette-group.component';

@Component({
  selector: 'vi-palette',
  standalone: true,
  imports: [PaletteSearchComponent, PaletteGroupComponent],
  templateUrl: './palette.component.html',
  styleUrl: './palette.component.scss',})
export class PaletteComponent implements OnInit {
  private registry = inject(BuilderRegistryService);
  private config = inject<BuilderConfig>(BUILDER_CONFIG);

  searchQuery = signal('');

  groupedItems = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const grouped = this.registry.getGrouped();
    const result: { group: string, items: ComponentDescriptor[] }[] = [];

    const allowedCategories = this.config.enabledCategories;

    grouped.forEach((items: ComponentDescriptor[], groupName: string) => {
      const filtered = items.filter((item: ComponentDescriptor) => {
        const isAllowed = allowedCategories ? allowedCategories.includes(item.category) : true;
        const matchesSearch = item.label.toLowerCase().includes(query) || item.type.toLowerCase().includes(query);
        return isAllowed && matchesSearch;
      });
      
      if (filtered.length > 0) {
        result.push({ group: groupName, items: filtered });
      }
    });

    return result;
  });

  ngOnInit() {}

  onSearch(query: string) {
    this.searchQuery.set(query);
  }
}
